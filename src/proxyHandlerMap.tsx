
import {log, logLevel} from "./log";
import {makeProxy, ProxyWrapper, Target} from "./ProxyWrapper";
import {DataChanged, lastReference} from "./proxyCommon";


export const proxyHandlerMap = {

    get(target : Target, prop: any, proxy: ProxyWrapper) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        switch (prop) {
            case 'get':
                return (key : any) => {
                    let value : any = proxy.__references__[prop] || targetValue.call(target, key);
                    if (typeof value === "object" && !value.__target__)
                        value = proxy.__references__[prop] = makeProxy(value,  prop, proxy);
                    else
                        value = targetValue.call(target, key)
                    proxy.__contexts__.forEach(context => context.referenced(proxy, prop));
                    lastReference.set(proxy, prop, value);
                    return value;
                }
            case 'set':
                return (key: any, newValue: any) => {
                    const oldObject = proxy.__references__[key];

                    if (oldObject && oldObject !== newValue) {
                        const parentProxy = oldObject.__parents__.get(proxy);
                        if (parentProxy)  {
                            delete parentProxy.props[prop];
                            if (Object.keys(parentProxy.props).length === 0) {
                                oldObject.__parents__.delete(proxy);
                                if (oldObject.__parents__.size === 0)
                                    oldObject.__contexts__.forEach(context =>
                                        context.disconnect(proxy)
                                    )
                            }
                        }
                    }

                    if (typeof newValue === "object")
                        proxy.__references__[prop] = makeProxy(newValue,  key, proxy);

                    // Change the value in the target
                    targetValue.call(target, key, newValue);

                    // Notify referencing object that referenced property has changed
                    DataChanged(proxy, prop, proxy);
                }
            case 'delete':
                DataChanged(proxy, prop, proxy);
                return targetValue.bind(target);

            case Symbol.iterator:
            case 'forEach':
            case 'entries':

                (target as unknown as Map<any, any>).forEach( (key : any, value : any) => {
                   value = proxy.__references__[key] || value;
                    if (typeof value === "object" && !value.__target__)
                        value = proxy.__references__[prop] = makeProxy(value,  prop, proxy);
                    proxy.__contexts__.forEach(context => context.referenced(proxy, prop));
                    lastReference.set(proxy, prop, value);
                });

            default:
                return targetValue.bind(target)
        }
    }
}
