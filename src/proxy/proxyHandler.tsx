import {createMemoization, isMemoized} from "../memoize";
import {log, logLevel} from "../log";
import {makeProxy, proxies, Target} from "../ProxyWrapper";
import {
    DataChanged,
    getterProps,
    propertyReferenced,
    proxyMissing,
    updateObjectReference
} from "./proxyCommon";
export const proxyHandler = {

    get(target : Target, prop: string, receiver: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;

        // Find proxyWrapper via WeakMap.  It should always be there
        const proxyWrapper = proxies.get(target) || proxyMissing(target, prop) ;
        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        // Handle case of getter which may need to be memoized
        const props : any = getterProps(target, prop);
        if (props) {
            if (isMemoized(prop, target)) {
                const memo = createMemoization(prop, target, proxyWrapper, props.get);
                return memo.getValue([]);
            } else
                Reflect.get(target, prop, receiver);
        }

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = proxyWrapper.__references__.get(prop) || Reflect.get(target, prop, target);
        if (typeof value === "object") {
            value = makeProxy(value,  prop, proxyWrapper);
        } else if (typeof value === "function") {
            if (isMemoized(prop, target)) {
                const memo = createMemoization(prop, target, proxyWrapper, value)
                if (!memo.closureFunction)
                    memo.closureFunction = (function MemoClosure (...args : any) {
                        return memo.getValue(args);
                    });
                return memo.closureFunction;
            } else
                return value.bind(proxyWrapper.__proxy__);
        }
        propertyReferenced(proxyWrapper, prop);
        return value;

    },

    set(target : Target, key: string, value: any): boolean {

        const proxyWrapper = proxies.get(target) || proxyMissing(target, key);
        if(logLevel.propertyChange) log(`${target.constructor.name}.${key} changed`);

        // Maintain proxyWrapper reference structure
        value = updateObjectReference(proxyWrapper, key, value)

        // Change the value in the target
        const ret = Reflect.set(target, key, value);

        // Notify referencing object that referenced property has changed
        DataChanged(proxyWrapper, key);

        return ret;
    },

    deleteProperty(target : Target, prop: string): boolean {

        const proxyWrapper = proxies.get(target) || proxyMissing(target, prop);
        if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} deleted`);

        updateObjectReference(proxyWrapper, prop);

        const ret = Reflect.deleteProperty(target, prop);

        // Notify referencing object that referenced property has changed
        DataChanged(proxyWrapper, prop);

        return ret;
    }

}

