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
    if (typeof targetIn === "object" && targetIn !== null) {
        const target  = targetIn as unknown as ProxyOrTarget;
        const proxy =  makeProxy(target)
        ConnectContext(proxy);
        return proxy as unknown as A;;
    } else
        throw new Error("Attempt to call proxy on a non-object");
}

export function observe<T>(targetIn: T, onChange : (target : string, prop : string) => void,  observer? : (target : T) => void) : ObservationContext {
    if (typeof targetIn === "object" && targetIn !== null) {
        const target  = targetIn as unknown as ProxyTarget;
        const observationContext = new ObservationContext(onChange);
        const proxy = makeProxy(target);
        ConnectContext(proxy, observationContext);
        if (observer) {
            setCurrentContext(observationContext);
            observer(proxy as unknown as T);
            setCurrentContext(undefined);
        } else
            observationContext.referenced(proxy as unknown as ProxyTarget, '*');
        return observationContext;
    } else
        throw new Error("Attempt to call observe on a non-object");
}


// Additional properties on objects being proxied
export interface Target {
    __referenced__ : boolean
    __proxy__ : ProxyTarget
    __memoizedProps__ : {[index: string] : boolean};
    __contexts__ : Map<ObservationContext, ObservationContext>;  // A context that can communicate with the component
    __parentReferences__ : Map<Target, { [index: string] : number }>;
    __memoContexts__ : { [key: string] : GetterMemo}
}
export interface ProxyTarget {
    __target__ : Target
}
export interface ProxyOrTarget {
    __target__?: Target;
    __proxy__? : ProxyTarget;
}
export function isInternalProperty (prop : any) {
    return ['__referenced__', '__proxy__', '__target__', '__memoizedProps__', '__contexts__', '__parentReferences__',
     '__memoContexts'].includes(prop)
}

export function makeProxy(proxyOrTarget : ProxyOrTarget) : ProxyTarget {

    // If we already have proxy return it
    if (proxyOrTarget.__proxy__)
        return proxyOrTarget.__proxy__;

    // Create the proxy with the appropriate handler
    let handler;
    if (proxyOrTarget instanceof Map)
        handler = proxyHandlerMap;
    else if (proxyOrTarget instanceof Set)
        handler = proxyHandlerSet;
    else if (proxyOrTarget instanceof Date)
        handler = proxyHandlerDate;
    else if (proxyOrTarget instanceof Array)
        handler = proxyHandlerArray;
    else
        handler = proxyHandler;
    const proxy = new Proxy(proxyOrTarget as any, handler) as ProxyTarget;

    const target = proxyOrTarget as unknown as Target;
    target.__parentReferences__ = new Map();
    target.__contexts__ = new Map();
    target.__memoContexts__ = {};
    target.__proxy__ = proxy;  // Get to a proxy from a target
    target.__referenced__ = false;

    return proxy;

}

