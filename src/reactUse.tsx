import {makeObservable, ProxyOrTarget, ProxyTarget, Target} from "./proxyObserve";
import {currentContext, Observer, ObserverOptions, setCurrentContext} from "./Observer";
import {getComponentName, log, logLevel} from "./log";
import {useEffect, useLayoutEffect, useRef, useState, NamedExoticComponent, FunctionComponent,
        PropsWithChildren, useContext} from "react";
import {lastReference, makeProxy} from "./proxy/proxyCommon";
import {Transaction, TransactionOptions} from "./Transaction";
import {addRoot, addTransaction, removeTransaction, endHighLevelFunctionCall, isRoot, removeRoot,
        startHighLevelFunctionCall} from "./devTools";
import React from "react";
import {Snapshots} from "./transition";

// Context value for maintaining the current transition sequence which drives the delivery
// of the correct snapshot version to components while being rendered. setSequence is called
// during the transition.  Snapshots are saved under the prior sequence number and returned
// to the component based on useDeferredValue
interface TransitionProviderValue {
    sequence: number;
    setSequence:  Function
}
const TransitionContext = React.createContext<TransitionProviderValue | undefined>(undefined);

// Determine whether in a useTransition
let inTransition = false;
export const isTransition = () => inTransition;

// Keep a transitionSequence number bumped on each new useTransition vs the one found in the context
// which is set via the state which should reflect Reacts assumption about current or offscreen renders
export let transitionSequence : number = 1;
export let observedTransitionSequence = -1;
export const useSnapshot = () => observedTransitionSequence > 0 && observedTransitionSequence < transitionSequence;

export function observer<P>(Component : FunctionComponent<P>, options? : ObserverOptions) : NamedExoticComponent<P> {

    const name = Component.name;
    return {[name] : function (props: PropsWithChildren<P>) {

            const transitionContext = useContext(TransitionContext);
            if (!transitionContext) {
                const Child = observer(Component, options);
                return <TransitionProvider><Child {...props}/></TransitionProvider>
            }


            const [,setSeq] = useState(1);
            let contextContainer : any = useRef(null);

            if (!contextContainer.current) {
                const componentName = (logLevel.render || logLevel.propertyTracking) ? getComponentName() : "";
                contextContainer.current = new Observer(() => setSeq((seq) => seq + 1), options, componentName);
            }
            const context = contextContainer.current;
            setCurrentContext(context);

            if(logLevel.render) log(`${context.componentName} render (${++context.renderCount})`);
            useLayoutEffect(() => {  // After every render process any references
                context.processPendingReferences();
            });
            useEffect(() => () => context.cleanup(), []);

            // Determine if idle

            const useDeferredValue = require('react').useDeferredValue;
            if (useDeferredValue) {
                const deferredSequence = useDeferredValue(transitionContext.sequence, {timeout: 5000});
                if (deferredSequence === transitionSequence && transitionSequence > 1)
                    Snapshots.cleanup();
             }

            // Wrap highest level in a transition provider that can pass down the transitionSequence number

            observedTransitionSequence = transitionContext.sequence;
            const ret = Component(props);
            observedTransitionSequence = -1;

            setCurrentContext(undefined); // current context only exists during course of render
            return ret;

        }}[name] as NamedExoticComponent<P>

}

function TransitionProvider({children} : {children : any}) {
    const [versionContext, setVersionContext] = useState({sequence: 1, setSequence: setVersion});
    return (
        <TransitionContext.Provider value={versionContext}>
            {children}
        </TransitionContext.Provider>
    );
    function setVersion(version : number) {
        setVersionContext({sequence: version, setSequence: setVersion})
    }
}

// Wrap the useTransition so we can set the current transition sequence number which will get recorded in
// snapshots created as state is mutated.  This let's us try and find snapshots with the same sequence
// numbers when state is referenced

export function useObservableTransition (options : any) {
    const useTransition = require('react').useTransition;
    const transitionContext = useContext(TransitionContext);
    const [isPending, startTransition] = useTransition(options);
    return [isPending, getTransitionStarter(startTransition, transitionContext)];
}

export function useObservableStartTransition () {
    const startTransition = require('react').startTransition;
    const transitionContext = useContext(TransitionContext);
    return getTransitionStarter(startTransition, transitionContext);
}

function getTransitionStarter (startTransition : Function, transitionContext : TransitionProviderValue | undefined) {
    return (callback : Function) => {
        startTransition( () => {
            if (logLevel.transitions)
                log(`starting mutable transition for ${transitionSequence}`);
            inTransition = true;
            callback();
            inTransition = false;
            ++transitionSequence;
            if (transitionContext) {
                transitionContext.setSequence(transitionSequence);
            } else
                throw Error("Component using useObservableTransition must be wrapped in Observe");
        });
    }
}

export function useDeferredObservable<T>(obj : T) : [T, (callback : Function) => void] {
    const useDeferredValue = require('react').useDeferredValue;
    const startTransition = require('react').startTransition;
    const transitionContext = useContext(TransitionContext);
    return [useDeferredValue(obj), getTransitionStarter(startTransition, transitionContext)];
}

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
    useLayoutEffect(() => {  // After every render process any references
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

export function bindObservables<P> (ClassBasedComponent : React.ComponentType<P>) : (args : P) => any {
    const name = ClassBasedComponent.name;
    return {[name] : function (props : any) {
            useObservables();
            return (
                <ClassBasedComponent {...props}/>
            )
        }}[name] as (args : P) => any
}


