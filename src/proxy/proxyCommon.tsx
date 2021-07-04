import {ProxyOrTarget, ProxyTarget, Target} from "../proxyObserve";
import {connectToContext, currentContext, currentSelectorContext} from "../ObservationContext";
import {proxyHandlerMap} from "./proxyHandlerMap";
import {proxyHandlerSet} from "./proxyHandlerSet";
import {proxyHandlerDate} from "./proxyHandlerDate";
import {proxyHandlerArray} from "./proxyHandlerArray";
import {proxyHandler} from "./proxyHandler";
import {Transaction} from "../Transaction";

export function makeProxy(proxyOrTarget : ProxyOrTarget, transaction? : Transaction) : ProxyTarget {

    if (!transaction)
        transaction = transaction || Transaction.defaultTransaction || Transaction.createDefaultTransaction();


    // If we already have proxy return it
    if (proxyOrTarget.__proxy__ && (proxyOrTarget as Target).__transaction__ === transaction)
        return proxyOrTarget.__proxy__;

    // Extract the target in case this is just a proxy with the wrong transaction
    if (proxyOrTarget.__target__)
        proxyOrTarget = proxyOrTarget.__target__ as ProxyOrTarget;

    // For other than the default transaction we need to create a copy of the target
    let parentTarget = undefined;
    if (transaction !== Transaction.defaultTransaction) {
        parentTarget = proxyOrTarget;
        if (proxyOrTarget instanceof Map)
            proxyOrTarget = new Map(proxyOrTarget as unknown as Map<any, any>) as unknown as ProxyOrTarget;
        else if (proxyOrTarget instanceof Set)
            proxyOrTarget = new Set(proxyOrTarget as unknown as Set<any>) as unknown as ProxyOrTarget;
        else if (proxyOrTarget instanceof Date)
            proxyOrTarget = new Date(proxyOrTarget) as unknown as ProxyOrTarget;
        else if (proxyOrTarget instanceof Array)
            proxyOrTarget = Array.from(proxyOrTarget) as unknown as ProxyOrTarget;
        else
            proxyOrTarget = Object.create( proxyOrTarget as any);

    }

    // Create the proxy with the appropriate handler
    let handler;
    if (proxyOrTarget instanceof Map)
        handler = proxyHandlerMap;
    else if (proxyOrTarget instanceof Set)
        handler = proxyHandlerSet;
    else if (proxyOrTarget instanceof Date)
        handler = proxyHandlerDate;
    else if (proxyOrTarget instanceof Array)
        handler = proxyHandlerArray;
    else
        handler = proxyHandler;
    const proxy = new Proxy(proxyOrTarget as any, handler) as ProxyTarget;

    const target = proxyOrTarget as unknown as Target;
    Object.defineProperty(target, '__parentReferences__', {writable: true, enumerable: false, value: new Map()});
    Object.defineProperty(target, '__contexts__', {writable: true, enumerable: false, value: new Map()});
    Object.defineProperty(target, '__memoContexts__', {writable: true, enumerable: false, value: {}});
    Object.defineProperty(target, '__proxy__', {writable: true, enumerable: false, value: proxy});  // Get to a proxy from a target
    Object.defineProperty(target, '__referenced__', {writable: true, enumerable: false, value: false});
    Object.defineProperty(target, '__transaction__', {writable: true, enumerable: false, value: transaction});
    Object.defineProperty(target, '__parentTarget__', {writable: true, enumerable: false, value: parentTarget});

    if (parentTarget)
        transaction.addProxy(proxy);

    return proxy;

}
export function getterProps(target : Target, prop : string) {
    const props = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop);
    return props && typeof props.get === "function" ? props : false;
}

export function DataChanged(target : Target, prop : string) {
    DataChangedInternal(target, prop, new Set());
    if (target.__transaction__)
        target.__transaction__.setDirty(target.__proxy__, prop);
}

export function DataChangedInternal(target : Target, prop : string, history : Set<Target>) {

    // Notify contexts of the change
    target.__contexts__.forEach(context => {
        context.changed(target.__proxy__,  prop);
    });

    // Pass notification up the chain of references
    target.__parentReferences__.forEach((referenceProps, parentProxyTarget) => {
        if (history.has(parentProxyTarget))
            return;
        history.add(parentProxyTarget)
        for (const prop in referenceProps)
            DataChangedInternal(parentProxyTarget, prop, history);
    });
}

/*
        When a property is referenced it may need to be made into a proxy and the referencing
        object updated with the proxy.  The property must also be registered by any contexts
        so they can observe future changes to the property
 */
export function propertyReferenced(target : Target, prop: any, value: any, setter?: (proxy: ProxyTarget) => void) : any {

    if (typeof value === "object" && value !== null) {

        if (!value.__target__  || value.__transaction__ !== target.__transaction__) {
            // In case target is for a transaction but child is not, first setup reference for default transaction
            if (target.__parentTarget__)
                propertyReferenced(target.__parentTarget__, prop, value)
            value = propertyUpdated(target, prop, value as unknown as ProxyOrTarget)
            if (setter)
                setter(value);
        }
        connectToContext(value);
    }

    // Let context know property was referenced
    if(currentContext)
        currentContext.referenced(target.__proxy__, prop);
    if(currentSelectorContext)
        currentSelectorContext.referenced(target.__proxy__, prop);
    lastReference.set(target, prop);

    return value;
}

/*
   When a property is updated it may need to be made into a proxy and have it's parentReferences added.
   Any previous value for the property that was a proxy may also need to have the parentReferences removed.
   Note: prop may be '*' for arrays, sets and maps in which case we keep a count of the reference
*/

export function propertyUpdated(parentTarget : Target, prop: string, child : any, oldChild? : any) : ProxyTarget | undefined {

    // Remove parent references from old child
    if (oldChild && oldChild.__target__) {

        const oldChildTarget = oldChild.__target__ as Target;

        // Remove old child parent reference
        const parentReference = oldChildTarget.__parentReferences__.get(parentTarget);
        if (parentReference) {
            const parentReferenceCount = parentReference[prop];
            if (parentReferenceCount !== undefined)
                if (parentReferenceCount > 1)
                    parentReference[prop] = parentReference[prop] - 1;
                else {
                    delete parentReference[prop];
                    if (Object.keys(parentReference).length === 0) {
                        oldChildTarget.__parentReferences__.delete(parentTarget);
                        if (oldChildTarget.__parentReferences__.size === 0)
                            oldChildTarget.__contexts__.forEach(context => context.disconnect(oldChildTarget.__proxy__));
                    }
                }
        }
    }


    // Proxify object and update reference in associated proxyWrapper
    if (typeof child === "object" && child !== null) {
        child = makeProxy(child as unknown as ProxyOrTarget, parentTarget.__transaction__);
        const parentReference = child.__parentReferences__.get(parentTarget);
        if (parentReference) {
            const parentReferenceCount = parentReference[prop];
            if (parentReferenceCount !== undefined)
                parentReference[prop] = parentReference[prop] + 1;
            else
                parentReference[prop] = 1;
        } else
            child.__parentReferences__.set(parentTarget, {[prop]: 1});
    }
    return child;
}

export interface LastReference {
    prop : string;
    target : Target | undefined;
    set: (target : any, prop : string) => void;
    clear: () => void;
}

export const lastReference : LastReference = {
    prop : "",
    target : undefined,
    set: function (target : Target, prop : string) : void {
        this.target = target;
        this.prop = prop;
    },
    clear: function () : void {
        this.target = undefined;
        this.prop = "";
    }
}
