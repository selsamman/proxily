import {log, logLevel} from "../log";
import {isInternalProperty, Target} from "../ProxyWrapper";
import {DataChanged, propertyReferenced, propertyUpdated} from "./proxyCommon";

export const proxyHandlerSet = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${typeof prop === 'string' ? prop : '?'} referenced`);

        switch (prop) {

            case 'has':
                return (value: any) => {
                    return targetValue.call(target, value);
                }

            case 'add':
                return (newValue: any) => {
                    propertyUpdated(target, '*', undefined, newValue);
                    DataChanged(target, prop);
                    return targetValue.call(target, newValue);
                }

            case 'delete':
                return function (key: any) {
                    DataChanged(target, key);
                    return  targetValue.call(target, key);
                }

            case Symbol.iterator:
            case 'forEach':
            case 'entries':
            case 'values':
                if (!target.__referenced__) {
                    (target as unknown as Set<any>).forEach( childTarget =>
                        propertyReferenced(target, childTarget, childTarget, (proxy) => {
                            (target as unknown as Set<any>).delete(childTarget);
                            (target as unknown as Set<any>).add(proxy);
                        })
                    );
                    target.__referenced__ = true;
                }

                return targetValue.bind(target);

                default:
                return targetValue.bind(target)
        }
    }
}
