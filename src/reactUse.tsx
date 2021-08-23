import {makeObservable, ProxyOrTarget, ProxyTarget, Target} from "./proxyObserve";
import {currentContext, Observer, ObserverOptions, setCurrentContext} from "./Observer";
import {getComponentName, log, logLevel} from "./log";
import {useEffect, useRef, useState} from "react";
import {lastReference, makeProxy} from "./proxy/proxyCommon";
import {Transaction, TransactionOptions} from "./Transaction";
import {addRoot, addTransaction, removeTransaction, endHighLevelFunctionCall, isRoot, removeRoot, startHighLevelFunctionCall
} from "./devTools";

export function useObservables(options? : ObserverOptions) : Observer {

    const [,setSeq] = useState(1);
    let contextContainer : any = useRef(null);

    if (!contextContainer.current) {
        const componentName = (logLevel.render || logLevel.propertyTracking) ? getComponentName() : "";
        contextContainer.current = new Observer(() => setSeq((seq) => seq + 1), options, componentName);
    }
    const context = contextContainer.current;
    setCurrentContext(context);
    if(logLevel.render) log(`${context.componentName} render (${++context.renderCount})`);
    useEffect(() => {  // After every render process any references
        context.processPendingReferences();
        setCurrentContext(undefined); // current context only exists during course of render
    });
    useEffect(() => () => context.cleanup(), []);
    return context;
}

export function useLocalObservable<T>(callback : () => T, transaction? : Transaction) : T {
    if (!callback)
        throw new Error("useLocalObservable did not have callback - did you mean useObservables?");
    const [observable] = useState( () => makeObservable(callback(), transaction,true));
    useEffect(() => {
        addRoot((observable as unknown as ProxyTarget).__target__);
        return () =>removeRoot((observable as unknown as ProxyTarget).__target__)
    }, []);

    return observable as unknown as T;
}

export function useObservableProp<S>(value: S) : [S, (value: S) => void] {
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

export function useTransaction(options? : Partial<TransactionOptions>) {
    const [transaction] = useState(() => {
        const transaction = new Transaction(options, true);
        return transaction;
    });
    useEffect(() => {
        addTransaction(transaction);
        return () => removeTransaction(transaction)
    },[]);

    return transaction;
}

export function useTransactable<A>(targetIn: A, transaction : Transaction) : A {
    const transactableRef : any = useRef();
    if (transactableRef.current) {
        useEffect(() => ()=>removeRoot(transactableRef.current.__target__), []);
        return transactableRef.current;
    }
    const target  = targetIn as unknown as ProxyOrTarget;
    const inRoot = isRoot(target.__target__ ? target.__target__ : target as Target);
    const proxy =  makeProxy(target as unknown as ProxyOrTarget, transaction);
    transactableRef.current = proxy;
    useEffect(() => {
        if (inRoot)
            addRoot(proxy.__target__);
        return ()=>removeRoot(proxy.__target__)
    }, []);
    return proxy as unknown as A;
}




