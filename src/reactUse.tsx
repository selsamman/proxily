import {Target,ProxyOrTarget} from "./proxyObserve";
import {currentContext, ObservationContext, setCurrentContext} from "./ObservationContext";
import {log, logLevel} from "./log";
import {useEffect, useRef, useState} from "react";
import {lastReference, makeProxy} from "./proxy/proxyCommon";
import {Transaction} from "./Transaction";

export function useObservables() : ObservationContext {
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
        context.processPendingReferences();
        setCurrentContext(undefined); // current context only exists during course of render
        return () => {
            context.cleanup()
        }
    },[]);
    return context;
}

export function useObservable<S>(value: S) : [S, (value: S) => void] {
    const {target, prop} = lastReference;
    if (!target)
        throw new Error("Improper useProp reference - is reference a proxy returned from useProxy?");
    if (currentContext) {
        target.__contexts__.set(currentContext, currentContext);
        currentContext.referenced(target.__proxy__, prop);
    } else
        throw new Error("Improper useProp reference - did you call useObservables?");
    lastReference.clear();
    return [
        value as S,
        (value : any) => Reflect.set(target.__proxy__, prop, value)
    ];

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
        currentContext.referenced(target.__proxy__, prop);
        currentContext.processPendingReferences();
    }
    lastReference.clear();
    return [
        value as S,
        (value : any) => Reflect.set(target.__proxy__, prop, value)
    ];
}

export function useProxy<A>(targetIn: A, transaction? : Transaction) : A {
    const target  = targetIn as unknown as Target;
    if(logLevel.useProxy) log(`useProxy ${target.constructor.name}`);

    createContext();
    const proxy =  makeProxy(target as unknown as ProxyOrTarget, transaction);
    return proxy as unknown as A;
}

export function useTransactable<A>(targetIn: A, transaction? : Transaction) : A {
    const transactableRef : any = useRef();
    if (transactableRef.current)
        return transactableRef.current;
    const target  = targetIn as unknown as Target;
    if(logLevel.useProxy) log(`makeTransactable ${target.constructor.name}`);
    const proxy =  makeProxy(target as unknown as ProxyOrTarget, transaction);
    transactableRef.current = proxy;
    return proxy as unknown as A;
}

function createContext() : ObservationContext {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [,setSeq] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    let contextContainer : any = useRef(null);

    if (!contextContainer.current)
        contextContainer.current = new ObservationContext(()=>setSeq((seq) => seq + 1));
    const context : ObservationContext = contextContainer.current;
    setCurrentContext(context);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        context.processPendingReferences();
        setCurrentContext(undefined); // current context only exists during course of render
        return () => {
            context.cleanup()
        }
    },[]);
    return context;
}



