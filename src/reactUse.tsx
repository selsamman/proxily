import {ProxyOrTarget, Target} from "./proxyObserve";
import {currentContext, ObservationContext, setCurrentContext} from "./ObservationContext";
import {log, logLevel} from "./log";
import {useEffect, useRef, useState} from "react";
import {lastReference, makeProxy} from "./proxy/proxyCommon";
import {Transaction} from "./Transaction";
import {addRoot, endHighLevelFunctionCall, isRoot, removeRoot, startHighLevelFunctionCall} from "./devTools";

export function useObservables() : ObservationContext {

    const [,setSeq] = useState(0);
    let contextContainer : any = useRef(null);

    if (!contextContainer.current)
        contextContainer.current = new ObservationContext(()=>setSeq((seq) => seq + 1));
    const context = contextContainer.current;
    setCurrentContext(context);

    useEffect(() => {  // After every render process any references
        context.processPendingReferences();
        setCurrentContext(undefined); // current context only exists during course of render
    });
    useEffect(() => () => context.cleanup(), []);
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
    const pseudoAction = "set" + prop.slice(0,1).toUpperCase() + prop.slice(1);
    return [
        value as S,
        (value : any) => {
            startHighLevelFunctionCall(target, pseudoAction);
            Reflect.set(target.__proxy__, prop, value)
            endHighLevelFunctionCall(target, pseudoAction)
        }
    ];

}

export function useTransactable<A>(targetIn: A, transaction : Transaction) : A {
    const transactableRef : any = useRef();
    if (transactableRef.current) {
        useEffect(() => ()=>removeRoot(transactableRef.current.__target__));
        return transactableRef.current;
    }
    const target  = targetIn as unknown as ProxyOrTarget;
    if(logLevel.useProxy) log(`makeTransactable ${target.constructor.name}`);
    const inRoot = isRoot(target.__target__ ? target.__target__ : target as Target);
    const proxy =  makeProxy(target as unknown as ProxyOrTarget, transaction);
    if (inRoot)
        addRoot(proxy.__target__);
    transactableRef.current = proxy;
    useEffect(() => ()=>removeRoot(proxy.__target__));
    return proxy as unknown as A;
}




