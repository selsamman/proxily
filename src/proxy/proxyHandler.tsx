import {CreateMemoization, isMemoized} from "../memoize";
import {log, logLevel} from "../log";
import {makeProxy, proxies, ProxyWrapper, Target} from "../ProxyWrapper";
import {DataChanged, getterProps, lastReference} from "./proxyCommon";
export const proxyHandler = {

    get(target : Target, prop: string, receiver: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const proxyWrapper = proxies.get(target);
        if (!proxyWrapper)
            return Reflect.get(target, prop, receiver);
        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        const props : any = getterProps(target, prop);
        if (props) {
            if (isMemoized(prop, target)) {
                const memo = CreateMemoization(prop, target, proxyWrapper, props.get);
                return memo.getValue([]);
            } else
                Reflect.get(target, prop, receiver);
        }

        // If an internal field or a getter just pass through
        if (prop.match(/__.*__/))
            return Reflect.get(target, prop, receiver);



        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = proxyWrapper.__references__[prop] || Reflect.get(target, prop, target);
        if (typeof value === "object" && !value.__target__)
            return proxyWrapper.__references__[prop] = makeProxy(value,  prop, proxyWrapper);
        else if (typeof value === "function") {
            if (isMemoized(prop, target)) {
                const memo = CreateMemoization(prop, target, proxyWrapper, value)
                if (!memo.closureFunction)
                    memo.closureFunction = (function MemoClosure (...args : any) {
                        return memo.getValue(args);
                    });
                return memo.closureFunction;
            } else
                return value.bind(proxyWrapper.__proxy__);
        } else {
            // Let the component context track who is using properties so they are notified if changed
            proxyWrapper.__contexts__.forEach(context => context.referenced(proxyWrapper, prop));
            lastReference.set(proxyWrapper, prop, value);
        }
        return value;

    },

    set(target : Target, prop: string, value: any, receiver: any): boolean {

        const proxyWrapper = proxies.get(target);
        if (!proxyWrapper)
            return Reflect.get(target, prop, receiver);
        if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} changed`);

        // Unlink parental reference
        const oldObject = proxyWrapper.__references__[prop];
        if (oldObject && oldObject !== value)
            removeChildReference(proxyWrapper, oldObject, prop)
        if (typeof value === "object")
            proxyWrapper.__references__[prop] = makeProxy(value,  prop, proxyWrapper);

        // Change the value in the target
        const ret = Reflect.set(target, prop, value);

        // Notify referencing object that referenced property has changed
        DataChanged(proxyWrapper, prop, proxyWrapper);

        return ret;
    },

    deleteProperty(target : Target, prop: string): boolean {

        const proxyWrapper = proxies.get(target);
        if (!proxyWrapper)
            return Reflect.deleteProperty(target, prop);
        if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} deleted`);


        // Unlink parental reference
        const oldObject = proxyWrapper.__references__[prop];
        removeChildReference(proxyWrapper, oldObject, prop);

        delete proxyWrapper.__references__[prop];
        const ret = Reflect.deleteProperty(target, prop);

        // Notify referencing object that referenced property has changed
        DataChanged(proxyWrapper, prop, proxyWrapper);

        return ret;
    }

}
function removeChildReference(proxy : ProxyWrapper, oldObject : ProxyWrapper, prop: string) {
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
