// A wrapper for the proxy that let's us track additional information
import {Observer, ObserverOptions, setCurrentContext} from "./Observer";
import {GetterMemo, SnapshotGetterMemo} from "./memoize";
import {makeProxy} from "./proxy/proxyCommon";
import {Transaction} from "./Transaction";
import {addRoot, removeRoot} from "./devTools";
import {Snapshots} from "./transition";

export function makeObservable<TYPE>(targetIn: TYPE, transaction? : Transaction, nonRoot? : boolean) : TYPE {
    if (typeof targetIn === "object" && targetIn !== null) {
        const target  = targetIn as unknown as ProxyOrTarget;
        const proxy =  makeProxy(target, transaction);
        if (!nonRoot)
            addRoot(proxy.__target__);
        return proxy as unknown as TYPE;
    } else
        throw new Error("Attempt to call proxy on a non-object");
}
export function releaseObservable(proxy : ProxyTarget) {
    removeRoot(proxy.__target__);
}

export function observe<T>(targetIn: T,
                           onChange : (target? : string, prop? : string) => void,
                           observer? : (target : T) => void,
                           observationOptions : ObserverOptions = {batch : true, delay: undefined, notifyParents : true})
                           : Observer
{
    if (typeof targetIn === "object" && targetIn !== null) {
        const target  = targetIn as unknown as ProxyTarget;
        const observationContext = new Observer(onChange, observationOptions);
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
export type MemoContexts = { [key: string] : GetterMemo | SnapshotGetterMemo};
export interface Target {
    __transaction__ : Transaction;
    __snapshot__ : Snapshots | undefined;
    __referenced__ : boolean
    __proxy__ : ProxyTarget
    __parentTarget__ : Target
    __nonObservableProps__ : {[index: string] : boolean};
    __memoizedProps__ : {[index: string] : boolean};
    __contexts__ : Map<Observer, Observer>;  // A context that can communicate with the component
    __parentReferences__ : Map<Target, { [index: string] : number }>;
    __memoContexts__ : MemoContexts
}
export interface ProxyTarget {
    __target__ : Target
}
export interface ProxyOrTarget {
    __target__?: Target;
    __proxy__? : ProxyTarget;
}
export function isInternalProperty (prop : any) {
    return ['__referenced__', '__proxy__', '__target__', '__nonObservableProps__', '__memoizedProps__', '__contexts__', '__parentReferences__', '__snapshot__',
     '__memoContexts__', '__transaction__', '__parentTarget__'].includes(prop)
}
export function target <T>(a: T) {return (a as unknown as any).__target__ as unknown as T};

export function jestMockFromClass<T>(c : abstract new (...args: any) => T,  o: Partial<T>) : T {

    const proto = c.prototype.constructor.prototype
    Object.getOwnPropertyNames(proto).forEach(p => {
        const props = Object.getOwnPropertyDescriptor(proto, p);
        if (typeof props?.get !== "function"  && typeof proto[p] == 'function')
            (o as unknown as any)[p] = jest.fn();

    })
    return o as T
}

export function nonObservable(obj?: any, propOrProps? : string | Array<string>) {
    if (obj && propOrProps) {
        if (obj.prototype)
            nonObservableClass(obj, propOrProps)
        else
            nonObservableObject(obj, propOrProps)
    }
    return function (classPrototype: any, prop: string) {
        nonObservableObject(classPrototype, prop);
    };
}

function nonObservableObject (obj: any, propOrProps : string | Array<string>) {
    const props = propOrProps instanceof Array ? propOrProps : [propOrProps];
    if (!obj.__nonObservableProps__)
        obj.__nonObservableProps__ = {};
    props.map(prop => obj.__nonObservableProps__[prop] = true);
}

function nonObservableClass (cls : any, propOrProps : string | Array<string>) {
    nonObservableObject(cls.prototype, propOrProps);
}

export function isObservable(prop: string, target: Target) {
    return !target.__nonObservableProps__ || !target.__nonObservableProps__.hasOwnProperty(prop);
}



