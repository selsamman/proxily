// A wrapper for the proxy that let's us track additional information
import {ObservationContext, setCurrentContext} from "./ObservationContext";
import {ConnectContext} from "./ObservationContext";
import {proxyHandler} from "./proxy/proxyHandler";
import {GetterMemo} from "./memoize";
import {proxyHandlerMap} from "./proxy/proxyHandlerMap";
import {proxyHandlerSet} from "./proxy/proxyHandlerSet";
import {proxyHandlerDate} from "./proxy/proxyHandlerDate";
import {proxyHandlerArray} from "./proxy/proxyHandlerArray";

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
    } else {
        const proxyWrapper = proxies.get(targetIn as unknown as Target);
        if (proxyWrapper)
            observationContext.referenced(proxyWrapper, '*');
    }
    return observationContext;
}


export interface ProxyWrapper {
    __target__ : Target;  // The actual object that is being proxied
    __proxy__ : any;
    __contexts__ : Map<ObservationContext, ObservationContext>;  // A context that can communicate with the component
    __references__ : Map<any, Target> // proxies for references to other objects in target
    __parents__ : Map<ProxyWrapper, ParentProxy>;
    __memoContexts__ : { [key: string] : GetterMemo}
}
export const proxies = new WeakMap<Target, ProxyWrapper>();

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

export function makeProxy(targetOrProxy : Target | typeof Proxy, parentProp? : string, parentProxyWrapper? : ProxyWrapper, observationContext? : ObservationContext) : Target {

    let proxyWrapper = proxies.get((targetOrProxy as unknown as any)?.__target__ || targetOrProxy)

    // If we already have proxy return it
    if (proxyWrapper) {
        ConnectContext(proxyWrapper, observationContext);
        return proxyWrapper.__proxy__;
    }
    const target = targetOrProxy as Target;


    // Create the proxy and wrap it so we can add additional properties
    let handler;
    if (target instanceof Map)
        handler = proxyHandlerMap;
    else if (target instanceof Set)
        handler = proxyHandlerSet;
    else if (target instanceof Date)
        handler = proxyHandlerDate;
    else if (target instanceof Array)
        handler = proxyHandlerArray;
    else
        handler = proxyHandler;
    const proxy = new Proxy(target, handler);


    proxyWrapper = {
        __parents__: new Map(),
        __target__: target,
        __proxy__: proxy,
        __contexts__: new Map(),
        __references__: new Map(),
        __memoContexts__ : {}
    }
    proxies.set(target, proxyWrapper);
    ConnectContext(proxyWrapper, observationContext);
    if (parentProp && parentProxyWrapper) {
        const parentProxy = proxyWrapper.__parents__.get(parentProxyWrapper);
        if (parentProxy)
            parentProxy.props[parentProp] = true;
        else
            proxyWrapper.__parents__.set(parentProxyWrapper, {proxy: parentProxyWrapper, props: {[parentProp]: true}});
    }
    return proxy;
}

