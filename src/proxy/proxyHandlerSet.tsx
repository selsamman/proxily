import {isInternalProperty, Target} from "../proxyObserve";
import {DataChanged, makeProxy, propertyReferenced, propertyUpdated} from "./proxyCommon";

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

        const setProxy = target.__proxy__ as unknown as Set<any>;
        switch (prop) {

            case 'has':
                return (value: any) => {
                    proxyAllElements();
                    if (typeof value === "object" && value !== null)
                        value = makeProxy(value, target.__transaction__);
                    return targetValue.call(target, value);
                }

            case 'add':
                return (newValue: any) => {
                    newValue = propertyUpdated(target, '*',  newValue);
                    if (target.__transaction__.timePositioning)
                        target.__transaction__.recordUndoRedo(
                            ()=>setProxy.delete(newValue),
                            ()=>setProxy.add(newValue));
                    DataChanged(target, newValue, true, newValue);
                    return targetValue.call(target, newValue);
                }

            case 'delete':
                return function (key: any) {
                    proxyAllElements();
                    if (target.__transaction__.timePositioning)
                        target.__transaction__.recordUndoRedo(
                            ()=>setProxy.add(key),
                            ()=>setProxy.delete(key));
                    DataChanged(target, key, true);
                    return  targetValue.call(target, key);
                }

            case Symbol.iterator:
            case 'forEach':
            case 'entries':
            case 'values':

                return (...args : any []) => {
                    proxyAllElements();
                    return (target as any)[prop].apply(target, args);
                }

            case 'clear':

                return (...args : any []) => {
                    const val =  (target as any)[prop].apply(target, args);
                    DataChanged(target, "*", true);
                    return val;
                }

            default:

                return targetValue.bind(target)
        }
        function proxyAllElements() {
            if (!target.__referenced__) {
                (target as unknown as Set<any>).forEach( childTarget =>
                    propertyReferenced(target, childTarget, childTarget, (proxy) => {
                        (target as unknown as Set<any>).delete(childTarget);
                        (target as unknown as Set<any>).add(proxy);
                    })
                );
                target.__referenced__ = true;
            }
        }

    }
}
