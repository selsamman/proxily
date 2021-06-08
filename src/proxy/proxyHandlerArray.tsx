
import {log, logLevel} from "../log";
import {makeProxy, proxies, Target} from "../ProxyWrapper";
import {DataChanged, propertyReferenced, proxyMissing} from "./proxyCommon";
import {proxyHandler} from "./proxyHandler";



export const proxyHandlerArray = {

    get(target : Target, prop: string) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;

        // Find proxyWrapper via WeakMap.  It should always be there
        const proxyWrapper = proxies.get(target) || proxyMissing(target, prop) ;
        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = proxyWrapper.__references__.get(prop) || Reflect.get(target, prop, target);
        if (typeof value === "object") {
            value = makeProxy(value,  prop, proxyWrapper);
            return value;
        } else if (typeof value === "function") {
            switch (prop) {
                case 'splice':
                case 'fill':
                case 'pop':
                case 'push':
                case 'reverse':
                case 'shift':
                case 'sort':
                case 'splice':
                case 'unshift':
                    return (...args : []) => {
                        DataChanged(proxyWrapper, prop);
                        return (target as any)[prop].apply(target, args);
                    }

                default:
                    return value.bind(proxyWrapper.__proxy__);
            }
        }
        propertyReferenced(proxyWrapper, prop);
        return value;

    },

    set: proxyHandler.set,

    deleteProperty: proxyHandler.deleteProperty

}

