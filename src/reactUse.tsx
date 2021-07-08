import {Target,ProxyOrTarget} from "./proxyObserve";
import {connectToContext, currentContext, ObservationContext, setCurrentContext} from "./ObservationContext";
import {log, logLevel} from "./log";
import {useEffect, useRef, useState} from "react";
import {lastReference, makeProxy} from "./proxy/proxyCommon";
import {Transaction} from "./Transaction";

export function useProxyContext<A>(apiIn: any, callback : (api: A) => void) {
    const api = useProxy<A>(apiIn);
    callback(api);
    return api;
}


export function useProp<S>(referenceProp: (() => S)) : [S, (value: S) => void] {
    createContext();
    lastReference.clear();
    const value = referenceProp();
    const {target, prop} = lastReference;
    if (!target)
        throw new Error("Improper useProp reference - is reference a proxy returned from useProxy?");
    if (currentContext) {
        target.__contexts__.set(currentContext, currentContext);
        currentContext.connect(target.__proxy__);
        currentContext.referenced(target.__proxy__, prop);
    }
    lastReference.clear();
    return [
        value as S,
        (value : any) => Reflect.set(target.__proxy__, prop, value)
    ];
}


export function useProxy<A>(targetIn: A, transaction? : Transaction) : A {
    const target  = targetIn as unknown as Target;
    if(logLevel.useProxy) log(`useCAPI ${target.constructor.name}`);

    const context = createContext();
    const proxy =  makeProxy(target as unknown as ProxyOrTarget, transaction);
    connectToContext(proxy, context);
    return proxy as unknown as A;
}
function createContext() : ObservationContext {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [,setSeq] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    let contextContainer : any = useRef(null);

    if (!contextContainer.current)
        contextContainer.current = new ObservationContext(()=>setSeq((seq) => seq + 1));
    const context = contextContainer.current;
    setCurrentContext(context);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setCurrentContext(undefined); // current context only exists during course of render
        return () => {
            context.cleanup()
        }
    },[]);
    return context;
}


