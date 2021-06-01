
import {log, logLevel} from "../log";
import {proxies, Target} from "../ProxyWrapper";
import {DataChanged, proxyMapOrSetElements, proxyMissing, updateObjectReference} from "./proxyCommon";


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

             case 'add':
                return (newValue: any) => {
                    updateObjectReference(proxyWrapper, newValue, newValue);

                    // Change the value in the target
                    targetValue.call(target, newValue);

                    // Notify referencing object that referenced property has changed
                    DataChanged(proxyWrapper, prop, proxyWrapper);
                }

            case 'delete':
                DataChanged(proxyWrapper, prop, proxyWrapper);
                return targetValue.bind(target);

            case Symbol.iterator:
            case 'forEach':
            case 'entries':

                proxyMapOrSetElements(target as unknown as Set<any>, proxyWrapper);

                default:
                return targetValue.bind(target)
        }
    }
}
