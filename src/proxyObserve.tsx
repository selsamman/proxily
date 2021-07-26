// A wrapper for the proxy that let's us track additional information
import {ObservationContext, setCurrentContext} from "./ObservationContext";
import {GetterMemo} from "./memoize";
import {makeProxy} from "./proxy/proxyCommon";
import {Transaction} from "./Transaction";

export function makeObservable<A>(targetIn: A, transaction? : Transaction) : A {
    if (typeof targetIn === "object" && targetIn !== null) {
        const target  = targetIn as unknown as ProxyOrTarget;
        const proxy =  makeProxy(target, transaction)
        return proxy as unknown as A;;
    } else
        throw new Error("Attempt to call proxy on a non-object");
}

export function observe<T>(targetIn: T, onChange : (target : string, prop : string) => void,  observer? : (target : T) => void) : ObservationContext {
    if (typeof targetIn === "object" && targetIn !== null) {
        const target  = targetIn as unknown as ProxyTarget;
        const observationContext = new ObservationContext(onChange);
        const proxy = makeProxy(target);
        if (observer) {
            setCurrentContext(observationContext);
            observer(proxy as unknown as T);
            setCurrentContext(undefined);
        } else
            observationContext.referenced(proxy as unknown as ProxyTarget, '*');
        observationContext.processPendingReferences();
        return observationContext;
    } else
        throw new Error("Attempt to call observe on a non-object");
}


// Additional properties on objects being proxied
export interface Target {
    __transaction__ : Transaction;
    __referenced__ : boolean
    __proxy__ : ProxyTarget
    __parentTarget__ : Target
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
     '__memoContexts__', '__transaction__', '__parentTarget__'].includes(prop)
}
export function target <T>(a: T) {return (a as unknown as any).__target__ as unknown as T};



