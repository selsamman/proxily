import {isInternalProperty, Target} from "../proxyObserve";
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

         const map = target as unknown as Map<any, any>
        const mapProxy = target.__proxy__ as unknown as Map<any, any>
        switch (prop) {
            case 'get':
                return (key : any) => propertyReferenced(target, key, targetValue.call(target, key),
                    (proxy) => map.set(key, proxy));

            case 'set':
                return (key: any, newValue: any) => {

                    const oldValue = map.get(key);
                    newValue = propertyUpdated(target, '*', newValue,oldValue);

                    // Change the value in the target
                    const ret = targetValue.call(target, key, newValue);

                    // Notify referencing object that referenced property has changed
                    if (target.__transaction__.timePositioning)
                        target.__transaction__.recordUndoRedo(
                            ()=>mapProxy.set(key, oldValue),
                            ()=>mapProxy.set(key, newValue));
                    DataChanged(target, key, true, newValue);
                    return ret;
                }

            case 'delete':
                return (key: any) => {

                    const oldValue = map.get(key);
                    propertyUpdated(target, '*', undefined, oldValue);

                    // Change the value in the target
                    targetValue.call(target, key);

                    if (target.__transaction__.timePositioning)
                        target.__transaction__.recordUndoRedo(
                            ()=>mapProxy.set(key, oldValue),
                            ()=>mapProxy.delete(key));

                    // Notify referencing object that referenced property has changed
                    DataChanged(target, key, true);

                }

            case Symbol.iterator:
            case 'forEach':
            case 'entries':

                return (...args : any []) => {
                    if (!target.__referenced__) {
                        (target as unknown as Map<any, any>).forEach( (childTarget, key) =>
                            propertyReferenced(target, key, childTarget, (proxy: any) => (target as unknown as Map<any, any>).set(key, proxy)));
                        target.__referenced__ = true;
                    }
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
    }
}
