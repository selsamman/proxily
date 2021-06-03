
import {log, logLevel} from "../log";
import {makeProxy, proxies, Target} from "../ProxyWrapper";
import {
    DataChanged,
    propertyReferenced,
    proxyMapOrSetElements,
    proxyMissing,
    updateObjectReference
} from "./proxyCommon";


export const proxyHandlerMap = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const proxyWrapper = proxies.get(target) || proxyMissing(target, prop);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        switch (prop) {
            case 'get':
                return (key : any) => {
                    let value : any = proxyWrapper.__references__.get(key) || targetValue.call(target, key);
                    if (typeof value === "object" && !value.__target__) {
                        value = makeProxy(value,  key, proxyWrapper);
                        proxyWrapper.__references__.set(key, value);
                    } else
                        value = targetValue.call(target, key)
                    propertyReferenced(proxyWrapper, key);
                    return value;
                }

            case 'set':
                return (key: any, newValue: any) => {

                    newValue = updateObjectReference(proxyWrapper, key, newValue);

                    // Change the value in the target
                    targetValue.call(target, key, newValue);

                    // Notify referencing object that referenced property has changed
                    DataChanged(proxyWrapper, prop);
                }

            case 'delete':
                return (key: any) => {

                    updateObjectReference(proxyWrapper, key);

                    // Change the value in the target
                    targetValue.call(target, key);

                    // Notify referencing object that referenced property has changed
                    DataChanged(proxyWrapper, prop);
                }

            case Symbol.iterator:
            case 'forEach':
            case 'entries':

                proxyMapOrSetElements(target as unknown as Map<any, any>, proxyWrapper);

            default:
                return targetValue.bind(target)
        }
    }
}
