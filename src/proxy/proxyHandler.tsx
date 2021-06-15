import {createMemoization, isMemoized} from "../memoize";
import {log, logLevel} from "../log";
import {isInternalProperty, ProxyTarget, Target} from "../ProxyWrapper";
import {
    DataChanged,
    getterProps,
    propertyReferenced,
    propertyUpdated
} from "./proxyCommon";
export const proxyHandler = {

    get(target : Target, prop: string, receiver: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        // Handle case of getter which may need to be memoized
        const props : any = getterProps(target, prop);
        if (props) {
            if (isMemoized(prop, target)) {
                const memo = createMemoization(prop, target, props.get);
                return memo.getValue([]);
            } else
                Reflect.get(target, prop, receiver);
        }

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = Reflect.get(target, prop, target);

        if (typeof value === "function") {
            if (isMemoized(prop, target)) {
                const memo = createMemoization(prop, target, value)
                if (!memo.closureFunction)
                    memo.closureFunction = (function MemoClosure (...args : any) {
                        return memo.getValue(args);
                    });
                return memo.closureFunction;
            } else
                return value.bind(target.__proxy__);
        } else
            return propertyReferenced(target, prop, value, (value : ProxyTarget) => Reflect.set(target, prop, value));
    },

    set(target : Target, key: string, value: any): boolean {

        if(logLevel.propertyChange) log(`${target.constructor.name}.${key} changed`);

        value = propertyUpdated(target, key, value, Reflect.get(target, key, target))
        const ret = Reflect.set(target, key, value);
        DataChanged(target, key);

        return ret;
    },

    deleteProperty(target : Target, prop: any): boolean {

        if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} deleted`);

        propertyUpdated(target,  prop, undefined, Reflect.get(target, prop, target));
        const ret = Reflect.deleteProperty(target, prop);
        DataChanged(target, prop);

        return ret;
    }

}

