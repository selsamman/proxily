
import {log, logLevel} from "../log";
import {proxies, Target} from "../ProxyWrapper";
import {
    DataChanged,
    deProxy,
    proxyMissing,
    proxySet,
    updateObjectReference
} from "./proxyCommon";


export const proxyHandlerSet = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const proxyWrapper = proxies.get(target) || proxyMissing(target, prop);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${typeof prop === 'string' ? prop : '?'} referenced`);

        switch (prop) {

            case 'has':
                return (value: any) => {
                    return targetValue.call(target, deProxy(value));
                }

            case 'add':
                return (newValue: any) => {
                    updateObjectReference(proxyWrapper, newValue, newValue);
                    DataChanged(proxyWrapper, prop);
                    return targetValue.call(target, deProxy(newValue));
                }

            case 'delete':
                return function (key: any) {
                    DataChanged(proxyWrapper, key);
                    return  targetValue.call(target, deProxy(key));
                }

            case Symbol.iterator:
            case 'forEach':
            case 'entries':
            case 'values':
                return targetValue.bind(proxySet(target as unknown as Set<any>, proxyWrapper));

                default:
                return targetValue.bind(target)
        }
    }
}
