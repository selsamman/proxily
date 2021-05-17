import {makeProxy, Target, proxies} from "./ProxyWrapper";
import {currentContext, ObservationContext, setCurrentContext} from "./ObservationContext";
import {log, logLevel} from "./log";
import {useEffect, useRef, useState} from "react";
import {lastReference} from "./proxy/proxyCommon";

export function useProxyContext<A>(apiIn: any, callback : (api: A) => void) {
    const api = useProxy<A>(apiIn);
    callback(api);
    return api;
}


export function useProp<S>(referenceProp: (() => S)) : [S, (value: S) => void] {
    createContext();
    referenceProp();
    const {proxyWrapper, prop, value} = lastReference;
    if (proxyWrapper  === undefined || !proxyWrapper.__contexts__)
        throw new Error("Improper useProp reference - is reference a proxy retruned from useProxy?");
    if (currentContext) {
        proxyWrapper.__contexts__.set(currentContext, currentContext);
        currentContext.connect(proxyWrapper);
        currentContext.referenced(proxyWrapper, prop);
    }
    lastReference.clear();
    return [
        value as S,
        (value : any) => Reflect.set(proxyWrapper.__proxy__, prop, value)
    ];
}


export function useProxy<A>(targetIn: A) : A {
    const target  = targetIn as unknown as Target;
    if(logLevel.useProxy) log(`useCAPI ${target.constructor.name}`);

    const context = createContext();
    const proxy =  makeProxy(target);
    if (!context.proxy)
        context.proxy = proxies.get(targetIn as unknown as Target);

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


