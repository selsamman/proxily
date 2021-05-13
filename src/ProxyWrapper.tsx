// A wrapper for the proxy that let's us track additional information
import {ObservationContext, setCurrentContext} from "./ObservationContext";
import {ConnectContext} from "./ObservationContext";
import {proxyHandler} from "./proxyHandler";
import {GetterMemo} from "./memoize";
import {proxyHandlerMap} from "./proxyHandlerMap";
import {proxyHandlerDate} from "./proxyHandlerDate";

export function proxy<A>(targetIn: A) : A {
    const target  = targetIn as unknown as Target;
    return makeProxy(target) as unknown as A;
}

export function observe<T>(targetIn: T, onChange : (target : string, prop : string) => void,  observer? : (target : T) => void) : ObservationContext {
    const observationContext = new ObservationContext(onChange);

    const proxy = makeProxy(targetIn as unknown as Target, undefined, undefined, observationContext);
    if (observer) {
        setCurrentContext(observationContext);
        observer(proxy as unknown as T);
        setCurrentContext(undefined);
    } else
        observationContext.referenced(proxy, '*');
    return observationContext;
}


export interface ProxyWrapper {
    __target__ : Target;  // The actual object that is being proxied
    __contexts__ : Map<ObservationContext, ObservationContext>;  // A context that can communicate with the component
    __references__ : { [key: string] : ProxyWrapper } // proxies for references to other objects in target
    __parents__ : Map<ProxyWrapper, ParentProxy>;
    __memoContexts__ : { [key: string] : GetterMemo}
}
const proxies = new WeakMap<Target, ProxyWrapper>();

// Additional properties on objects being proxied
export interface Target {
    __memoizedProps__ : {[index: string] : boolean};
}

export interface ConnectedProxy {
    proxy: ProxyWrapper;
    referencedProps : { [index:string] : boolean};
}

// Track both the referencing property name and the object
export interface ParentProxy {
    props : { [index: string] : boolean };
    proxy : ProxyWrapper;
}

export function makeProxy(targetOrProxyWrapper : Target | ProxyWrapper, parentProp? : string, parentProxyWrapper? : ProxyWrapper, observationContext? : ObservationContext) : ProxyWrapper {
    // If passed a proxywrapper just use it
    if ((targetOrProxyWrapper as ProxyWrapper).__target__) {
        const proxy : ProxyWrapper = targetOrProxyWrapper as ProxyWrapper;
        ConnectContext(proxy, observationContext);
        return proxy;
    }
    const target = targetOrProxyWrapper as Target;

    // If object already has a proxy use it
    const previousProxy = proxies.get(target);
    if (previousProxy) {
        ConnectContext(previousProxy);
        return previousProxy;
    }

    // Create the proxy and wrap it so we can add additional properties
    let handler;
    if (target instanceof Map)
        handler = proxyHandlerMap;
    else if (target instanceof Date)
        handler = proxyHandlerDate;
    else
        handler = proxyHandler;
    const proxy = Object.create(new Proxy(target, handler)) as ProxyWrapper;

    proxies.set(target, proxy);

    proxy.__parents__ = new Map();
    proxy.__target__ = target;
    proxy.__contexts__ = new Map();
    proxy.__references__ = {};
    ConnectContext(proxy, observationContext);
    if (parentProp && parentProxyWrapper) {
        const parentProxy = proxy.__parents__.get(parentProxyWrapper);
        if (parentProxy)
            parentProxy.props[parentProp] = true;
        else
            proxy.__parents__.set(parentProxyWrapper, {proxy: parentProxyWrapper, props: {[parentProp]: true}});
    }
    return proxy;
}

