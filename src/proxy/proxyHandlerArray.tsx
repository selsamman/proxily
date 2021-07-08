import {log, logLevel} from "../log";
import {isInternalProperty, Target} from "../proxyObserve";
import {DataChanged, propertyReferenced, propertyUpdated} from "./proxyCommon";
import {proxyHandler} from "./proxyHandler";

export const proxyHandlerArray = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        // Find proxyWrapper via WeakMap.  It should always be there
        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = Reflect.get(target, prop, target);
        const arr = target as unknown as Array<any>;
        if (typeof value === "function") {
            // For mutable methods note that the array
            const length = (target as unknown as []).length;
            switch (prop) {

                // Hit all elements and make sure they are proxied first time
                case 'forEach':
                case 'entries':
                case 'map':
                case 'reduce':
                case 'reduceRight':
                case 'slice':
                case 'values':
                case 'every':

                case Symbol.iterator:

                    // If this is the first time the array is referenced make proxies where needed them and update
                    return (...args : any []) => {
                        proxyAllElements();
                        const val = (target as any)[prop].apply(target, args);
                        return val;
                    }
                case 'sort':

                    // If this is the first time the array is referenced make proxies where needed them and update
                    return (...args : any []) => {
                        proxyAllElements();
                        const before = recordBefore(target);
                        const val = (target as any)[prop].apply(target, args);
                        recordAfter(target, before);
                        return val;
                    }
                case 'copyWithin': // Todo: Make more efficient
                    return (...args : any []) => {
                        const before = recordBefore(target);
                        deleteElementReferences(target, 0, length);
                        const val = (target as any)[prop].apply(target, args);
                        target.__referenced__ = false;
                        proxyAllElements();
                        recordAfter(target, before);
                        DataChanged(target, '*');
                        return val;
                    }

                case 'concat': // Make proxies for new array being concatenated
                    return (...args : any []) => {
                        proxyAllElements()
                        return  (target as any)[prop].apply(target, args);
                    }

                case 'fill': // Make proxies for new values being concatenated
                    return (...args : any []) => {
                        const before = recordBefore(target);
                        const first = args[1] || 0;
                        const last = args[2] === undefined ? length - 1 : Math.min(args[2], length - 1);
                        deleteElementReferences(target, first, last);
                        makeProxies(target, args.slice(0, 1), last - first + 1);
                        const val =  (target as any)[prop].apply(target, args);
                        recordAfter(target, before);
                        DataChanged(target, '*');
                        return val;
                    }

                case 'pop': // remove parent references from deleted entriey
                    return (...args : any []) => {
                        deleteElementReferences(target, length -  1, length - 1);
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo(()=>arr.push(val), ()=>arr.pop())
                        DataChanged(target, '*');
                        return val;
                    }
                case 'push': // Make proxy for new element
                    return (...args : any []) => {
                        makeProxies(target, args.slice(0, 1));
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo( ()=>{for (let ix = 0; ix < args.length; ++ix) arr.pop()}, ()=>arr.push(...args))
                        DataChanged(target, '*');
                        return val;
                    }
                case 'shift': // remove parent references from deleted entry
                    return (...args : any []) => {
                        deleteElementReferences(target, 0, 0);
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo( ()=>arr.unshift(val), ()=>arr.shift())
                        DataChanged(target, '*');
                        return val;
                    }
                case 'splice': // Make proxies for new additions & remove parent references from deleted entries
                    return (...args : any []) => {
                        const before = recordBefore(target);
                        const first = args[0] < 0 ? length + args[0] : args[0];
                        const last = args[1] === 'undefined' ? length - 1 : first + args[1] - 1;
                        if (first < length)
                            deleteElementReferences(target, first, last);
                        makeProxies(target, args.slice(2, args.length));
                        const val =  (target as any)[prop].apply(target, args);
                        recordAfter(target, before);
                        DataChanged(target, '*');
                        return val;
                    }

                case 'unshift': // Make proxy for new element
                    return (...args : any []) => {
                        makeProxies(target, args.slice(0, 1));
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo( ()=>{for (let ix = 0; ix < args.length; ++ix) arr.shift()}, ()=>arr.unshift(...args), )
                        DataChanged(target, '*');
                        return val;
                    }

                default:
                    return value.bind(target);
            }
        } else
            return propertyReferenced(target, '*', Reflect.get(target, prop), (value) => Reflect.set(target, prop, value));

        function proxyAllElements() {
            if (!target.__referenced__) {
                const len = (target as unknown as []).length;
                for (let ix = 0; ix < len; ++ix)
                    propertyReferenced(target, '*', target[ix], (proxy: any) => target[ix] = proxy)
                target.__referenced__ = true;
            }
        }

    },

    set: proxyHandler.set,

    deleteProperty: proxyHandler.deleteProperty

}

function makeProxies(target : Target, targets : any [], count = 1) : void {
    targets.map((childTarget, ix) => {
        while(count--)
            targets[ix] = propertyUpdated(target, '*', childTarget)
        return childTarget;
    });
}
function deleteElementReferences(target: Target, first : number, last : number) {
    for (let ix = first; ix <= last; ++ix)
        propertyUpdated(target, '*', undefined, target[ix]);
}

function recordBefore(target : Target) {
    if (target.__transaction__.timePositioning)
        return Array.from(target as unknown as Array<any>);
    else
        return [];
}
function recordAfter(target : Target, before : Array<any>) {
    const after = Array.from(target as unknown as Array<any>);
    if (!target.__transaction__.timePositioning)
        return;
    function undo () {
        (target as unknown as Array<any>).splice(0, (target as unknown as Array<any>).length);
        for (var ix = 0; ix < before.length; ++ix)
            (target as unknown as Array<any>)[ix] = before[ix];
    }
    function redo () {
        (target as unknown as Array<any>).splice(0, (target as unknown as Array<any>).length);
        for (var ix = 0; ix < after.length; ++ix)
            (target as unknown as Array<any>)[ix] = after[ix];
    }
    target.__transaction__.recordUndoRedo(undo, redo);
}


