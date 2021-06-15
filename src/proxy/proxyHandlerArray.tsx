import {log, logLevel} from "../log";
import {isInternalProperty, Target} from "../ProxyWrapper";
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
        if (typeof value === "function") {
            // For mutable methods note that the array
            const length = (target as unknown as []).length;
            switch (prop) {

                // Hit all elements and make sure they are proxied first time
                case 'forEach':
                case 'entries':
                case 'map':
                case 'slice':
                case 'values':
                case Symbol.iterator:

                    // If this is the first time the array is referenced make proxies where needed them and update
                    if (!target.__referenced__) {
                        const len = (target as unknown as []).length;
                        for (let ix = 0; ix < len; ++ix)
                            propertyReferenced(target, '*', target[ix], (proxy: any) => target[ix] = proxy)
                        target.__referenced__ = true;
                    }
                    return value.bind(target);

                case 'concat': // Make proxies for new array being concatenated
                    return (...args : any []) => {
                        args = makeProxies(target, args[1]);
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }
                case 'fill': // Make proxies for new values being concatenated
                    return (...args : any []) => {
                        const first = args[1] || 0;
                        const last = args[2] === 'undefined' ? length - 1 : Math.min(args[2], length - 1);
                        deleteElementReferences(target, first, last);
                        args = makeProxies(target, args.slice(0, 1), last - first + 1);
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }
                case 'pop': // remove parent references from deleted entriey
                    return (...args : any []) => {
                        deleteElementReferences(target, length -  1, length - 1);
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }
                case 'push': // Make proxy for new element
                    return (...args : any []) => {
                        args = makeProxies(target, args.slice(0, 1));
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }
                case 'shift': // remove parent references from deleted entriey
                    return (...args : any []) => {
                        deleteElementReferences(target, 0, 0);
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }
                case 'splice': // Make proxies for new additions & remove parent references from deleted entries
                    return (...args : any []) => {
                        const first = args[0] < 0 ? length + args[0] : args[0];
                        const last = args[1] === 'undefined' ? length - 1 : first + args[1] - 1;
                        if (first < length)
                            deleteElementReferences(target, first, last);
                        args = makeProxies(target, args.slice(2, args.length));
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }

                case 'push': // extends array
                    return (...args : any []) => {
                        args = makeProxies(target, args[1]);
                        DataChanged(target, '*');
                    }
                case 'unshift': // Make proxy for new element
                    return (...args : any []) => {
                        args = makeProxies(target, args);
                        DataChanged(target, '*');
                        return (target as any)[prop].apply(target, args);
                    }

                default:
                    return value.bind(target);
            }
        } else
            return propertyReferenced(target, '*', Reflect.get(target, prop), (value) => Reflect.set(target, prop, value));

    },

    set: proxyHandler.set,

    deleteProperty: proxyHandler.deleteProperty

}

function makeProxies(target : Target, targets : any [], count = 1) {
    return targets.map(childTarget => {
        while(count--)
            childTarget = propertyUpdated(target, '*', childTarget)
        return childTarget;
    });
    return targets;
}
function deleteElementReferences(target: Target, first : number, last : number) {
    for (let ix = first; ix < last; ++ix)
        propertyUpdated(target, '*', undefined, target[ix]);
}

