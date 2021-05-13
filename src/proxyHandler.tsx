import {CreateMemoization, isMemoized} from "./memoize";
import {log, logLevel} from "./log";
import {makeProxy, ProxyWrapper, Target} from "./ProxyWrapper";
import {DataChanged, getterProps, lastReference} from "./proxyCommon";
export const proxyHandler = {

    get(target : Target, prop: string, proxy: ProxyWrapper) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const props : any = getterProps(target, prop);
        if (props) {
            if (isMemoized(prop, target)) {
                const memo = CreateMemoization(prop, target, proxy, props.get);
                return memo.getValue([]);
            } else
                Reflect.get(target, prop, proxy);
        }

        // If an internal field or a getter just pass through
        if (prop.match(/__.*__/))
            return Reflect.get(target, prop, proxy);

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        // If referencing an object that is not proxied proxy it and keep on the side for serving up
        let value : any = proxy.__references__[prop] || Reflect.get(target, prop, proxy);
        if (typeof value === "object" && !value.__target__)
            return proxy.__references__[prop] = makeProxy(value,  prop, proxy);
        else if (typeof value === "function") {
            if (isMemoized(prop, target)) {
                const memo = CreateMemoization(prop, target, proxy, value)
                if (!memo.closureFunction)
                    memo.closureFunction = (function MemoClosure (...args : any) {
                        return memo.getValue(args);
                    });
                return memo.closureFunction;
            } else
                return value.bind(proxy);
        } else {
            // Let the component context track who is using properties so they are notified if changed
            proxy.__contexts__.forEach(context => context.referenced(proxy, prop));
            lastReference.set(proxy, prop, value);
        }
        return value;

    },

    set(target : Target, prop: string, value: any, proxy: ProxyWrapper): boolean {

        if (prop.match(/__.*__/) /*||
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop)*/)
            return Reflect.set(target, prop, value, proxy)

        if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} changed`);

        // Unlink parental reference
        const oldObject = proxy.__references__[prop];
        if (oldObject && oldObject !== value)
            removeChildReference(proxy, oldObject, prop)
        if (typeof value === "object")
            proxy.__references__[prop] = makeProxy(value,  prop, proxy);

        // Change the value in the target
        const ret = Reflect.set(target, prop, value);

        // Notify referencing object that referenced property has changed
        DataChanged(proxy, prop, proxy);

        return ret;
    },

    deleteProperty(target : Target, prop: string): boolean {

        if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} changed`);

        // Unlink parental reference
        //const oldObject = proxy.__references__[prop];
        //removeChildReference(proxy, oldObject, prop);

        //delete proxy.__references__[prop];
        const ret = Reflect.deleteProperty(target, prop);

        // Notify referencing object that referenced property has changed
        //DataChanged(proxy, prop, proxy);

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
