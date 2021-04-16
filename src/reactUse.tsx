import {lastReference, MakeProxy, Target} from "./ProxyWrapper";
import {currentContext, ObservationContext, setCurrentContext} from "./ObservationContext";
import {log, logLevel} from "./log";
import {useEffect, useRef, useState} from "react";

export function useProxyContext<A>(apiIn: any, callback : (api: A) => void) {
    const api = useProxy<A>(apiIn);
    callback(api);
    return api;
}


export function useProp<S>(referenceProp: (() => S)) : [S, (value: S) => void] {
    createContext();
    referenceProp();
    const {proxy, prop, value} = lastReference;
    if (proxy  === undefined || !proxy.__contexts__)
        throw new Error("Improper useProp reference - is reference a proxy retruned from useProxy?");
    if (currentContext) {
        proxy.__contexts__.set(currentContext, currentContext);
        currentContext.connect(proxy);
        currentContext.referenced(proxy, prop);
    }
    lastReference.clear();
    return [
        value as S,
        (value : any) => Reflect.set(proxy, prop, value)
    ];
}


export function useProxy<A>(targetIn: A, component? : any) : A {
    const target  = targetIn as unknown as Target;
    if(logLevel.useProxy) log(`useCAPI ${target.constructor.name}`);

    let context : ObservationContext;
    const isFunctionalComponent = !component || typeof component === 'function' || typeof component === 'string';
    if (isFunctionalComponent) {
        const componentName = typeof component === 'string' ? component :
            component && component.name ? component.name : "FunctionalComponent"
        context = createContext(componentName);
    } else {
        const componentName = component.constructor && component.constructor.displayName ?
            component.constructor.displayName : "Component"
        const setSeq = (seq : number) => component.setState({___force_render___ : seq})
        if (!component.___proxyfi_context___)
            component.___proxyfi_context___ = new ObservationContext(componentName, setSeq);
        context = component.___proxyfi_context___;
    }

    if (!context.proxy)
        context.proxy = MakeProxy(target);

    return context.proxy as unknown as A;
}
function createContext(componentName? : string) : ObservationContext{
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [,setSeq] = useState(0);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    let contextContainer : any = useRef(null);

    if (!contextContainer.current)
        contextContainer.current = new ObservationContext(componentName || "Anynomous", setSeq);
    const context = contextContainer.current;
    setCurrentContext(context);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        setCurrentContext(undefined); // current context only exists during course of render
        return () => context.cleanup()
    });
    return context;
}


