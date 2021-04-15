// Typescript CAPI
import {useEffect, useRef, useState} from "react";

export interface LogLevels {
    propertyReference: boolean
    propertyChange : boolean
    useProxy: boolean;
    render: boolean;
}

let logLevel : Partial<LogLevels> = {}

let log = (data : string) : void => {
    console.log(data);
}
export function setLog(logFN : (data : string) => void) {
    log = logFN;
}
export function setLogLevel(levels : Partial<LogLevels>) {
    logLevel = levels;
}
interface ConnectedProxy {
    proxy: ProxyWrapper;
    referencedProps : { [index:string] : boolean};
}
export class ObservationContext {
    constructor(name : string, forceReRender : (value : any) => void) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.forceReRender = forceReRender;
        this.name = name || "";
    }
    name = "";
    forceReRender : (value : any) => void | undefined;
    reRenderSequence = 0;
    connectedProxies : Map<ProxyWrapper, ConnectedProxy> = new Map();
    proxy : ProxyWrapper | undefined;

    changed(proxy: ProxyWrapper, target : string, prop : string) {
        if (this.connectedProxies.get(proxy)?.referencedProps[prop as any]) {
            if(logLevel.render) log(`${this.name} ${target}.${prop} forced re-render`);
            this.forceReRender(++this.reRenderSequence);
        }
    };
    referenced(proxy : ProxyWrapper, prop : string) {
        const connectedProxy = this.connectedProxies.get(proxy)
        if (connectedProxy)
            connectedProxy.referencedProps[prop]  = true;
    };
    connect (proxy : ProxyWrapper) {
        this.connectedProxies.set(proxy, {proxy: proxy, referencedProps: {}});
    }
    disconnect (proxy: ProxyWrapper) {
        this.connectedProxies.delete(proxy);
    }
    cleanup () {
        // Allow Context to be garbage collected
        this.connectedProxies.forEach(connectedProxy => {
            if (connectedProxy.proxy.__contexts__.get(this))
                connectedProxy.proxy.__contexts__.delete(this)
        });
        this.connectedProxies = new Map();
    }

}
// A wrapper for the proxy that let's us track additional information
interface ProxyWrapper {
    __target__ : Target;  // The actual object that is being proxied
    __contexts__ : Map<ObservationContext, ObservationContext>;  // A context that can communicate with the component
    __references__ : { [key: string] : ProxyWrapper } // proxies for references to other objects in target
    __parents__ : Map<ProxyWrapper, ParentProxy>;
    __memoContexts__ : { [key: string] : GetterMemo}
}

// Additional properties on objects being proxied
interface Target {
    __memoizedProps__ : {[index: string] : boolean};
}

// Track both the referencing property name and the object
interface ParentProxy {
    props : { [index: string] : boolean };
    proxy : ProxyWrapper;
}

export function useProxyContext<A>(apiIn: any, callback : (api: A) => void) {
    const api = useProxy<A>(apiIn);
    callback(api);
    return api;
}
interface LastReference {
    value: Object;
    prop : string;
    proxy : ProxyWrapper | undefined;
    set: (target : any, prop : string, value : any) => void;
    clear: () => void;
}

const lastReference : LastReference = {
    value: {},
    prop : "",
    proxy : undefined,
    set: function (proxy : ProxyWrapper, prop : string, value : any) : void {
        this.proxy = proxy;
        this.prop = prop;
        this.value = value;
    },
    clear: function () : void {
        this.proxy = undefined;
        this.prop = "";
        this.value = {};
    }
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
let currentContext : ObservationContext | undefined = undefined;
let currentSelectorContext : ObservationContext | undefined = undefined;
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
    currentContext = context;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
        currentContext = undefined; // current context only exists during course of render
        return () => context.cleanup()
    });
    return context;
}
function MakeProxy(targetOrProxyWrapper : Target | ProxyWrapper, parentProp? : string, parentProxyWrapper?: ProxyWrapper) : ProxyWrapper {

    const handler = {

        get(target : Target, prop: string, proxy: ProxyWrapper): any {

            // Only way to get a reference to the object being proxied
            if (prop === '__target__')
                return target;
            const props : any = getterProps(target, prop);
            if (props) {
                if (isMemoized(prop, target)) {
                    const memo = CreateMemoization(prop, target, proxy, props.get);
                    return memo.getValue([]);
                } else
                    Reflect.get(target, prop, proxy);
            }

            // If an internal field or a getter just pass through
            if (prop.match(/__.*__/))
                return Reflect.get(target, prop, proxy);

            if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

            // If referencing an object that is not proxied proxy it and keep on the side for serving up
            let value : any = proxy.__references__[prop] || Reflect.get(target, prop, proxy);
            if (typeof value === "object" && !value.__target__)
                return proxy.__references__[prop] = MakeProxy(value,  prop, proxy);
            else if (typeof value === "function") {
                if (isMemoized(prop, target)) {
                    const memo = CreateMemoization(prop, target, proxy, value)
                    if (!memo.closureFunction)
                        memo.closureFunction = (function MemoClosure (...args : any) {
                            return memo.getValue(args);
                        });
                    return memo.closureFunction;
                } else
                    return value.bind(proxy);
            } else {
                // Let the component context track who is using properties so they are notified if changed
                proxy.__contexts__.forEach(context => context.referenced(proxy, prop));
                lastReference.set(proxy, prop, value);
            }
            return value;

        },

        set(target : Target, prop: string, value: any, proxy: ProxyWrapper): boolean {

            if (prop.match(/__.*__/) ||
                Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop))
                return Reflect.set(target, prop, value, proxy)

            if(logLevel.propertyChange) log(`${target.constructor.name}.${prop} changed`);

            // Unlink parental reference
            const oldObject = proxy.__references__[prop];
            if (oldObject && oldObject !== value) {
                const parentProxy = oldObject.__parents__.get(proxy);
                if (parentProxy)  {
                    delete parentProxy.props[prop];
                    if (Object.keys(parentProxy.props).length === 0) {
                        oldObject.__parents__.delete(proxy);
                        if (oldObject.__parents__.size === 0)
                            oldObject.__contexts__.forEach(context =>
                                context.disconnect(proxy)
                            )
                    }
                }
            }
            if (typeof value === "object")
                proxy.__references__[prop] = MakeProxy(value,  prop, proxy);

            // Change the value in the target
            const ret = Reflect.set(target, prop, value);

            // Notify referencing object that referenced property has changed
            DataChanged(proxy, prop, proxy);

            return ret;
        }
    }

    if ((targetOrProxyWrapper as ProxyWrapper).__target__) {
        const proxy : ProxyWrapper = targetOrProxyWrapper as ProxyWrapper;
        ConnectContext(proxy);
        return proxy;
    }
    const target = targetOrProxyWrapper as Target;
    // Create the proxy and wrap it so we can add additional properties
    const proxy = Object.create(new Proxy(target, handler)) as ProxyWrapper;

    proxy.__parents__ = new Map();
    proxy.__target__ = target;
    proxy.__contexts__ = new Map();
    proxy.__references__ = {};
    ConnectContext(proxy);
    if (parentProp && parentProxyWrapper) {
        const parentProxy = proxy.__parents__.get(parentProxyWrapper);
        if (parentProxy)
            parentProxy.props[parentProp] = true;
        else
            proxy.__parents__.set(parentProxyWrapper, {proxy: parentProxyWrapper, props: {[parentProp]: true}});
    }
    return proxy;
}
function getterProps(target : Target, prop : string) {
    const props = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop);
    return props && typeof props.get === "function" ? props : false;
}
function ConnectContext (proxy : ProxyWrapper) {
    if(currentContext) {
        proxy.__contexts__.set(currentContext, currentContext);
        currentContext.connect(proxy);
    }
    if(currentSelectorContext) {
        proxy.__contexts__.set(currentSelectorContext, currentSelectorContext);
        currentSelectorContext.connect(proxy);
    }
}
function DataChanged(proxy : ProxyWrapper, prop : string, originalProxy : ProxyWrapper) {

    // Notify any other proxies of the change
    proxy.__contexts__.forEach(context => {
        context.changed(proxy, proxy.__target__.constructor.name, prop);
    });

    // Pass notification up the chain of references
    proxy.__parents__.forEach(parent => {
        if (originalProxy === parent.proxy)
            return;
        for(const prop in parent.props)
            DataChanged(parent.proxy, prop, originalProxy);
    });
}
export function memoizeObject (obj: any, propOrProps : string | Array<string>) {
    const props = propOrProps instanceof Array ? propOrProps : [propOrProps];
    if (!obj.__memoizedProps__)
        obj.__memoizedProps__ = {};
    props.map(prop => obj.__memoizedProps__[prop] = true);
}
export function memoizeClass (cls : any, propOrProps : string | Array<string>) {
    memoizeObject(cls.prototype, propOrProps);
}

class GetterMemo {
    constructor(prop: string, valueFunction: () => any, proxy : ProxyWrapper) {
        this.valueFunction = valueFunction;
        this.context = new ObservationContext("GetterMemo-" + prop , ()=>{
            this.dependentsChanged = true
        });
        this.proxy = proxy;
    }
    lastArgumentValues = [];
    proxy: ProxyWrapper
    lastValue: any;
    dependentsChanged = true;
    context: ObservationContext;
    valueFunction: () => any;
    closureFunction : any;
    getValue (args : any) {
        if (this.dependentsChanged || this.argsChanged(args)) {
            this.updateLastValue(args);
            this.lastArgumentValues = args;
            this.dependentsChanged = false;
        }
        return this.lastValue;
    }
    argsChanged (args : any) {
        let changed = false;
        args.map((arg : any, ix : number) => {
            if (this.lastArgumentValues[ix] !== arg)
                changed = true;
        });
        return changed;
    }
    updateLastValue (args : any) {
        const context = currentSelectorContext;
        currentSelectorContext = this.context;
        this.lastValue = this.valueFunction.apply(this.proxy, args);
        currentSelectorContext = context;
    }
    connectProxy(proxy : ProxyWrapper) {
        const context = currentSelectorContext;
        currentSelectorContext = this.context;
        ConnectContext(proxy);
        currentSelectorContext = context;
    }
    cleanup () {
        this.context.cleanup();
    }
}
function isMemoized(prop: string, target: Target) {
    return target.__memoizedProps__ && target.__memoizedProps__[prop];
}
function CreateMemoization (prop: string, target: Target, proxy: ProxyWrapper, valueFunction: any) : GetterMemo {
    if (target.__memoizedProps__ && target.__memoizedProps__[prop] &&
        (!proxy.__memoContexts__ || !proxy.__memoContexts__[prop]))
    {
        if (!proxy.__memoContexts__)
            proxy.__memoContexts__ = {};
        const memo = new GetterMemo(prop, valueFunction, proxy);
        memo.connectProxy(proxy);
        proxy.__memoContexts__[prop] = memo;

    }
    return proxy.__memoContexts__[prop];
}

