import {observable, observe, ProxyOrTarget, ProxyTarget, Target} from "./proxyObserve";
import {getCurrentContext, Observer, ObserverOptions, setCurrentContext} from "./Observer";
import {log, logLevel} from "./log";
import {useEffect, useLayoutEffect, useRef, useState, NamedExoticComponent, FunctionComponent, PropsWithChildren, useContext} from "react";
import {getHandler, lastReference, makeProxy} from "./proxy/proxyCommon";
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
let transitionSequence : number = 1;
let observedTransitionSequence = -1;
let inUseDeferredValue = false;
export const getObservedTransitionSequence = () => observedTransitionSequence;
export const getTransitionSequence = () => transitionSequence;
export const useSnapshot = () => !inUseDeferredValue && observedTransitionSequence > 0 && observedTransitionSequence < transitionSequence;

const defaultObserverOptions = {
    batch : true,
    delay: undefined,
    notifyParents: false,
    memo: true,
}

export function observer<P>(Component : FunctionComponent<P>, options : ObserverOptions = defaultObserverOptions) : NamedExoticComponent<P> {

    const name = Component.name;
    function wrapper (props: PropsWithChildren<P>) {

        const transitionContext = useContext(TransitionContext);
        if (!transitionContext) {
            const Child = observer(Component, options);
            return <TransitionProvider><Child {...props}/></TransitionProvider>
        }

        const [,setSeq] = useState(1);
        let contextContainer : any = useRef(null);

        if (!contextContainer.current) {
            if(logLevel.render) log(`${name} mount`);
            contextContainer.current = new Observer(() => setSeq((seq) => seq + 1), options, name);
        }
        const context = contextContainer.current;
        setCurrentContext(context);

        if(logLevel.render) log(`${context.componentName} render (${++context.renderCount})`);
        useLayoutEffect(() => () => {
            if(logLevel.render) log(`${context.componentName} unmount (${context.renderCount})`);
            context.cleanup()
        }, []);
        //useLayoutEffect(() => {  // After every render process any references
        //    context.processPendingReferences();
        //});


        // Wrap highest level in a transition provider that can pass down the transitionSequence number

        observedTransitionSequence = transitionContext.sequence;
        try {
            const ret = Component(props);
            observedTransitionSequence = -1;
            setCurrentContext(undefined);
            context.processPendingReferences(); // current context only exists during course of render
            return ret;
        } catch (e) {
            observedTransitionSequence = -1;
            setCurrentContext(undefined); // current context only exists during course of render
            context.processPendingReferences();
            if(logLevel.render) log(`${context.componentName} suspended (${context.renderCount})`)
            throw e;
        }

    }

    return (options.memo ? {[name] : React.memo(wrapper)}[name] : {[name] : wrapper}[name]) as unknown as NamedExoticComponent<P>;

}

// Feeding consumers of proxy objects is driven by how children of an overarching context provider see the
// the data in that context. The data is simply the transition sequence number.
// If child components see an older version of that sequence number then we feed them snapshots
function TransitionProvider({children} : {children : any}) {
    const [versionContext, setVersionContext] = useState({sequence: transitionSequence, setSequence: setVersion});

    // Determine if idle
    const useDeferredValue = require('react').useDeferredValue;
    if (useDeferredValue) {
        const deferredSequence = useDeferredValue(versionContext.sequence, {timeout: 5000});
        if (deferredSequence === transitionSequence && transitionSequence > 1)
            Snapshots.cleanup();
    }

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

export function useObservableTransition (options? : any) {
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

export function getCurrentValue<T>(state : T, cb : (state : T) => any) {
    inUseDeferredValue = true;
    const ret = cb(state);
    inUseDeferredValue = false;
    return ret;
}


function getTransitionStarter (startTransition : Function, transitionContext : TransitionProviderValue | undefined) {
    return (callback : Function) => {
        Observer.beginBatch();
        startTransition( () => {
            if (logLevel.transitions)
                log(`starting mutable transition for ${transitionSequence}`);
            inTransition = true;
            callback();
            Observer.playBatch();
            inTransition = false;
            ++transitionSequence;
            if (transitionContext) {
                transitionContext.setSequence(transitionSequence);
            } else
                throw Error("Component using useObservableTransition must be wrapped in Observe");
        });
        Observer.playBatch(true);

    }
}


export function useLocalObservable<T>(callback : () => T, transaction? : Transaction) : T {
    if (!callback)
        throw new Error("useLocalObservable did not have callback - did you mean useObservables?");
    const [localObservable] = useState( () => observable(callback(), transaction,true));
    useEffect(() => {
        addRoot((localObservable as unknown as ProxyTarget).__target__);
        return () =>removeRoot((localObservable as unknown as ProxyTarget).__target__)
    }, []);

    return localObservable as unknown as T;
}

export function useObservableProp<S>(value: S) : [S, (value: S) => void] {
    const {target, prop} = lastReference;
    if (!target)
        throw new Error("Improper useProp reference - is reference a proxy returned from useProxy?");
    const context = getCurrentContext();
    if (context) {
        target.__contexts__.set(context, context);
        context.referenced(target.__proxy__, prop);
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
        return new Transaction(options);
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

export function useAsImmutable<A>(targetIn: A) : A {

    // Non-objects require no processing
    if (typeof targetIn !== "object")
        return targetIn;

    // Create observer that will indicate whether value changed
    let contextContainer : any = useRef(null);
    if (!contextContainer.current)
        contextContainer.current = {
            observer: observe(targetIn, () => contextContainer.current.changed = true, undefined, {notifyParents: true}),
            changed: false
        }
    useLayoutEffect(() => () => {
        contextContainer.current.observer.cleanup()
    }, []);
    if (contextContainer.current.changed) {
        contextContainer.current.changed = false;
        if (!(targetIn as any).__target__)
            throw ("useAsImmutable called on non-observable object");
        else {
            const data = (targetIn as any).__target__;
            if (data instanceof  Array)
                return (data as []).slice(0) as unknown as A;
            else
                return new Proxy((targetIn as any).__target__ as any, getHandler(targetIn)) as A;
        }
    } else
        return targetIn;
}
/*
export function bindObservables<P> (ClassBasedComponent : React.ComponentType<P>) : (args : P) => any {
    const name = ClassBasedComponent.name;

    return {[name] : function (props : any) {
        const immutableProps : any = {};
        for (let prop in props)
            immutableProps[prop] = useAsImmutable(props[prop]);
        return (
            <ClassBasedComponent {...props}/>
        )
    }}[name] as (args : P) => any
}
*/

