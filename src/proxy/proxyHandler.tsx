import {createMemoization, isMemoized} from "../memoize";
import {setCurrentFunction} from "../log";
import {isInternalProperty, ProxyTarget, Target} from "../proxyObserve";
import {DataChanged, getSnapshotIfNeeded, getterProps, propertyReferenced, propertyUpdated} from "./proxyCommon";
import {Transaction} from "../Transaction";
import {startHighLevelFunctionCall, endHighLevelFunctionCall} from "../devTools";
import {Observer} from "../Observer";

let callLevel = 0;
export const proxyHandler = {

    get(target : Target, prop: string, receiver: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        target = getSnapshotIfNeeded(target);

        // Handle case of getter which may need to be memoized
        const props : any = getterProps(target, prop);
        if (props) {
            if (isMemoized(prop, target)) {
                const memo = createMemoization(prop, target, props.get);
                return memo.getValue([]);
            } else
                return Reflect.get(target, prop, receiver);
        }

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = Reflect.get(target, prop, target);

        if (typeof value === "function") {
            if (value._isMockFunction)
                return value;
            else if (isMemoized(prop, target)) {
                let memo = createMemoization(prop, target, value);
                return (...args : any) => {
                    return nestCall(()=>memo.getValue(args), target);
                }
            } else {
                const proxyFunction = (...args : any) => {
                    return nestCall(() => value.apply(target.__proxy__, args), target, prop);
                }
                proxyFunction.__original__ = value;
                return proxyFunction;
            }
        }
        return propertyReferenced(target, prop, value, (value : ProxyTarget) => Reflect.set(target, prop, value));
    },

    set(target : Target, prop: string, value: any, receiver : unknown, isContainer = false): boolean {

        if (isInternalProperty(prop))
            return Reflect.set(target, prop, value);

        const oldValue = Reflect.get(target, prop, target);
        value = propertyUpdated(target, prop, value, oldValue)
        const ret = Reflect.set(target, prop, value, receiver);
        DataChanged(target, prop, isContainer, value);

        target.__transaction__.recordTimePosition(target, prop, oldValue, value);

        return ret;
    },

    deleteProperty(target : Target, key: any, isContainer = false): boolean {

        const oldValue = Reflect.get(target, key, target);
        propertyUpdated(target,  key, undefined, oldValue);
        let ret;
        if (target.__transaction__ === Transaction.defaultTransaction)
            ret = Reflect.deleteProperty(target, key);
        else
            ret = Reflect.set(target, key, undefined);
        DataChanged(target, key, isContainer,undefined);
        target.__transaction__.recordTimePosition(target, key, oldValue, undefined);

        return ret;
    }

}

export const groupUpdates = (callback : Function) => {
    nestCall(callback);
}
function nestCall(callback : Function, target? : Target, prop? : string) {
    if (callLevel === 0) {
        if (target) {
            target.__transaction__.startTopLevelCall();
            if (prop)
                startHighLevelFunctionCall(target, prop);
        }
        Observer.startTopLevelCall();
    }
    callLevel++
    try {
        setCurrentFunction(target, prop);
        const ret = callback();
        setCurrentFunction();
        --callLevel;
        if (callLevel === 0) {
            if (target) {
                target.__transaction__.endTopLevelCall();
                if (prop)
                    endHighLevelFunctionCall(target, prop);
            }
            Observer.endTopLevelCall();
        }
        return ret;
    } catch (e) {
        --callLevel;
        if (callLevel === 0) {
            if (target) {
                target.__transaction__.endTopLevelCall();
                if (prop)
                    endHighLevelFunctionCall(target, prop);
            }
            Observer.endTopLevelCall();
        }
        throw (e);
    }
}
