import {createMemoization, isMemoized} from "../memoize";
import {log, logLevel} from "../log";
import {isInternalProperty, ProxyTarget, Target} from "../proxyObserve";
let callLevel = 0;
import {
    DataChanged,
    getterProps,
    propertyReferenced,
    propertyUpdated
} from "./proxyCommon";
import {Transaction} from "../Transaction";
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
                const memo = createMemoization(prop, target, value);
                return (...args : any) => {
                    if (callLevel === 0)
                        target.__transaction__.startTopLevelCall();
                    callLevel++
                    try {
                        const ret =  memo.getValue(args);
                        --callLevel;
                        if (callLevel === 0)
                            target.__transaction__.endTopLevelCall();
                        return ret;
                    } catch (e) {
                        --callLevel;
                        if (callLevel === 0)
                            target.__transaction__.endTopLevelCall();
                        throw (e);
                    }
                }
            } else {
                return (...args : any) => {
                    if (callLevel === 0)
                        target.__transaction__.startTopLevelCall();
                    callLevel++
                    try {
                        const ret = value.apply(target.__proxy__, args);
                        --callLevel;
                        if (callLevel === 0)
                            target.__transaction__.endTopLevelCall();
                        return ret;
                    } catch (e) {
                        --callLevel;
                        if (callLevel === 0)
                            target.__transaction__.endTopLevelCall();
                        throw (e);
                    }
                }
            }
        }
        return propertyReferenced(target, prop, value, (value : ProxyTarget) => Reflect.set(target, prop, value));
    },

    set(target : Target, key: string, value: any): boolean {

        if(logLevel.propertyChange) log(`${target.constructor.name}.${key} changed`);

        const oldValue = Reflect.get(target, key, target);
        value = propertyUpdated(target, key, value, oldValue)
        const ret = Reflect.set(target, key, value);
        DataChanged(target, key);

        target.__transaction__.recordTimePosition(target, key, oldValue, value);

        return ret;
    },

    deleteProperty(target : Target, key: any): boolean {

        if(logLevel.propertyChange) log(`${target.constructor.name}.${key} deleted`);
        const oldValue = Reflect.get(target, key, target);
        propertyUpdated(target,  key, undefined, oldValue);
        let ret;
        if (target.__transaction__ !== Transaction.defaultTransaction)
            ret = Reflect.deleteProperty(target, key);
        else
            ret = Reflect.set(target, key, undefined);
        DataChanged(target, key);
        target.__transaction__.recordTimePosition(target, key, oldValue, undefined);

        return ret;
    }

}

