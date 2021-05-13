
import {log, logLevel} from "./log";
import {makeProxy, proxies, Target} from "./ProxyWrapper";
import {DataChanged, lastReference} from "./proxyCommon";


export const proxyHandlerMap = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const proxyWrapper = proxies.get(target);
        if (!proxyWrapper)
            return Reflect.get(target, prop);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        switch (prop) {
            case 'get':
                return (key : any) => {
                    let value : any = proxyWrapper.__references__[prop] || targetValue.call(target, key);
                    if (typeof value === "object" && !value.__target__)
                        value = proxyWrapper.__references__[prop] = makeProxy(value,  prop, proxyWrapper);
                    else
                        value = targetValue.call(target, key)
                    proxyWrapper.__contexts__.forEach(context => context.referenced(proxyWrapper, prop));
                    lastReference.set(proxyWrapper, prop, value);
                    return value;
                }
            case 'set':
                return (key: any, newValue: any) => {
                    const oldObject = proxyWrapper.__references__[key];

                    if (oldObject && oldObject !== newValue) {
                        const parentProxy = oldObject.__parents__.get(proxyWrapper);
                        if (parentProxy)  {
                            delete parentProxy.props[prop];
                            if (Object.keys(parentProxy.props).length === 0) {
                                oldObject.__parents__.delete(proxyWrapper);
                                if (oldObject.__parents__.size === 0)
                                    oldObject.__contexts__.forEach(context =>
                                        context.disconnect(proxyWrapper)
                                    )
                            }
                        }
                    }

                    if (typeof newValue === "object")
                        proxyWrapper.__references__[prop] = makeProxy(newValue,  key, proxyWrapper);

                    // Change the value in the target
                    targetValue.call(target, key, newValue);

                    // Notify referencing object that referenced property has changed
                    DataChanged(proxyWrapper, prop, proxyWrapper);
                }
            case 'delete':
                DataChanged(proxyWrapper, prop, proxyWrapper);
                return targetValue.bind(target);

            case Symbol.iterator:
            case 'forEach':
            case 'entries':

                (target as unknown as Map<any, any>).forEach( (key : any, value : any) => {
                   value = proxyWrapper.__references__[key] || value;
                    if (typeof value === "object" && !value.__target__)
                        value = proxyWrapper.__references__[prop] = makeProxy(value,  prop, proxyWrapper);
                    proxyWrapper.__contexts__.forEach(context => context.referenced(proxyWrapper, prop));
                    lastReference.set(proxyWrapper, prop, value);
                });

            default:
                return targetValue.bind(target)
        }
    }
}
