// A wrapper for the proxy that let's us track additional information
import {ObservationContext} from "./ObservationContext";
import {CreateMemoization, GetterMemo, isMemoized} from "./MemoContainer";
import {log, logLevel} from "./log";
import {ConnectContext} from "./ObservationContext";
export interface ConnectedProxy {
    proxy: ProxyWrapper;
    referencedProps : { [index:string] : boolean};
}
export interface ProxyWrapper {
    __target__ : Target;  // The actual object that is being proxied
    __contexts__ : Map<ObservationContext, ObservationContext>;  // A context that can communicate with the component
    __references__ : { [key: string] : ProxyWrapper } // proxies for references to other objects in target
    __parents__ : Map<ProxyWrapper, ParentProxy>;
    __memoContexts__ : { [key: string] : GetterMemo}
}

// Additional properties on objects being proxied
export interface Target {
    __memoizedProps__ : {[index: string] : boolean};
}

// Track both the referencing property name and the object
export interface ParentProxy {
    props : { [index: string] : boolean };
    proxy : ProxyWrapper;
}
export function MakeProxy(targetOrProxyWrapper : Target | ProxyWrapper, parentProp? : string, parentProxyWrapper?: ProxyWrapper) : ProxyWrapper {

    const handler = {

        get(target : Target, prop: string, proxy: ProxyWrapper): any {

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
                return proxy.__references__[prop] = MakeProxy(value,  prop, proxy);
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

            if (prop.match(/__.*__/) ||
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop))
                return Reflect.set(target, prop, value, proxy)

            if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} changed`);

            // Unlink parental reference
            const oldObject = proxy.__references__[prop];
            if (oldObject && oldObject !== value) {
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
            if (typeof value === "object")
                proxy.__references__[prop] = MakeProxy(value,  prop, proxy);

            // Change the value in the target
            const ret = Reflect.set(target, prop, value);

            // Notify referencing object that referenced property has changed
            DataChanged(proxy, prop, proxy);

            return ret;
        }
    }

    if ((targetOrProxyWrapper as ProxyWrapper).__target__) {
        const proxy : ProxyWrapper = targetOrProxyWrapper as ProxyWrapper;
        ConnectContext(proxy);
        return proxy;
    }
    const target = targetOrProxyWrapper as Target;
    // Create the proxy and wrap it so we can add additional properties
    const proxy = Object.create(new Proxy(target, handler)) as ProxyWrapper;

    proxy.__parents__ = new Map();
    proxy.__target__ = target;
    proxy.__contexts__ = new Map();
    proxy.__references__ = {};
    ConnectContext(proxy);
    if (parentProp && parentProxyWrapper) {
        const parentProxy = proxy.__parents__.get(parentProxyWrapper);
        if (parentProxy)
            parentProxy.props[parentProp] = true;
        else
            proxy.__parents__.set(parentProxyWrapper, {proxy: parentProxyWrapper, props: {[parentProp]: true}});
    }
    return proxy;
}
function getterProps(target : Target, prop : string) {
    const props = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop);
    return props && typeof props.get === "function" ? props : false;
}

function DataChanged(proxy : ProxyWrapper, prop : string, originalProxy : ProxyWrapper) {

    // Notify any other proxies of the change
    proxy.__contexts__.forEach(context => {
        context.changed(proxy, proxy.__target__.constructor.name, prop);
    });

    // Pass notification up the chain of references
    proxy.__parents__.forEach(parent => {
        if (originalProxy === parent.proxy)
            return;
        for(const prop in parent.props)
            DataChanged(parent.proxy, prop, originalProxy);
    });
}
interface LastReference {
    value: Object;
    prop : string;
    proxy : ProxyWrapper | undefined;
    set: (target : any, prop : string, value : any) => void;
    clear: () => void;
}

export const lastReference : LastReference = {
    value: {},
    prop : "",
    proxy : undefined,
    set: function (proxy : ProxyWrapper, prop : string, value : any) : void {
        this.proxy = proxy;
        this.prop = prop;
        this.value = value;
    },
    clear: function () : void {
        this.proxy = undefined;
        this.prop = "";
        this.value = {};
    }
}
