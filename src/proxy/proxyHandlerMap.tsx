import {log, logLevel} from "../log";
import {isInternalProperty, Target} from "../ProxyWrapper";
import {DataChanged, propertyReferenced, propertyUpdated} from "./proxyCommon";


export const proxyHandlerMap = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        switch (prop) {
            case 'get':
                return (key : any) => propertyReferenced(target, key, targetValue.call(target, key),
                    (proxy) => (target as unknown as Map<any, any>).set(key, proxy));

            case 'set':
                return (key: any, newValue: any) => {

                    newValue = propertyUpdated(target, '*', newValue, (target as unknown as Map<any, any>).get(key));

                    // Change the value in the target
                    targetValue.call(target, key, newValue);

                    // Notify referencing object that referenced property has changed
                    DataChanged(target, prop);
                }

            case 'delete':
                return (key: any) => {

                    propertyUpdated(target, '*', undefined, (target as unknown as Map<any, any>).get(key));

                    // Change the value in the target
                    targetValue.call(target, key);

                    // Notify referencing object that referenced property has changed
                    DataChanged(target, prop);
                }

            case Symbol.iterator:
            case 'forEach':
            case 'entries':
                if (!target.__referenced__) {
                    (target as unknown as Map<any, any>).forEach( (childTarget, key) =>
                        propertyReferenced(target, key, childTarget, (proxy: any) => (target as unknown as Map<any, any>).set(key, proxy)));
                    target.__referenced__ = true;
                }

            default:
                return targetValue.bind(target)
        }
    }
}
