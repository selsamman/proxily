import {isInternalProperty, Target} from "../proxyObserve";
import {DataChanged, propertyReferenced, propertyUpdated, makeProxy} from "./proxyCommon";
import {proxyHandler} from "./proxyHandler";

export const proxyHandlerArray = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = Reflect.get(target, prop, target);
        const arrProxy = target.__proxy__ as unknown as Array<any>;
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
                case 'indexOf':
                case 'lastIndexOf':
                case 'includes':

                    return (obj : any) => {
                        if (typeof obj === "object")
                            obj = makeProxy(obj, target.__transaction__);
                        proxyAllElements();
                        const val = (target as any)[prop].call(target, obj);
                        return val;
                    }
                case 'some':
                case 'every':
                case 'find':
                case 'findIndex':
                case 'filter':

                    return (callBack : any) => {
                        proxyAllElements();
                        const val = (target as any)[prop].call(target, callBack);
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
                        DataChanged(target, '*', true);
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
                        makeProxies(target, args, 0, 0,last - first + 1);
                        const val =  (target as any)[prop].apply(target, args);
                        recordAfter(target, before);
                        DataChanged(target, '*', true);
                        return val;
                    }

                case 'pop': // remove parent references from deleted entriey
                    return (...args : any []) => {
                        deleteElementReferences(target, length -  1, length - 1);
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo(
                                ()=>arrProxy.push(val),
                                ()=>arrProxy.pop())
                        DataChanged(target, '*', true);
                        return val;
                    }
                case 'push': // Make proxy for new element
                    return (...args : any []) => {
                        makeProxies(target, args, 0, 0);
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo(
                                ()=> {
                                    for (let ix = 0; ix < args.length; ++ix)
                                        arrProxy.pop()
                                },
                                ()=>arrProxy.push(...args))
                        DataChanged(target, '*', true);
                        return val;
                    }
                case 'shift': // remove parent references from deleted entry
                    return (...args : any []) => {
                        deleteElementReferences(target, 0, 0);
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo(
                                ()=>arrProxy.unshift(val),
                                ()=>arrProxy.shift())
                        DataChanged(target, '*', true);
                        return val;
                    }
                case 'splice': // Make proxies for new additions & remove parent references from deleted entries
                    return (...args : any []) => {
                        const before = recordBefore(target);
                        const first = args[0] < 0 ? length + args[0] : args[0];
                        const last = args[1] === 'undefined' ? length - 1 : first + args[1] - 1;
                        if (first < length)
                            deleteElementReferences(target, first, last);
                        makeProxies(target, args,2, args.length - 1);
                        const val =  (target as any)[prop].apply(target, args);
                        recordAfter(target, before);
                        DataChanged(target, '*', true);
                        return val;
                    }

                case 'unshift': // Make proxy for new element
                    return (...args : any []) => {
                        makeProxies(target, args, 0, 0);
                        const val =  (target as any)[prop].apply(target, args);
                        if (target.__transaction__.timePositioning)
                            target.__transaction__.recordUndoRedo(
                                ()=> {
                                    for (let ix = 0; ix < args.length; ++ix)
                                        arrProxy.shift()
                                },
                                ()=>arrProxy.unshift(...args), )
                        DataChanged(target, '*', true);
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

    set (target : Target, key : string, value : any, receiver : any) {
        return proxyHandler.set(target, key, value, receiver,true);
    },

    deleteProperty (target : Target, key : string) {
        return proxyHandler.deleteProperty(target, key, true);
    }

}

function makeProxies(target : Target, targets : any [], first  : number, last : number, count = 1) : void {
    targets.map((childTarget, ix) => {
        if (ix >= first && ix <= last)
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


