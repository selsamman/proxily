import {makeProxy, ProxyOrTarget, ProxyTarget, Target} from "../ProxyWrapper";
import {ConnectContext, currentContext, currentSelectorContext} from "../ObservationContext";

export function getterProps(target : Target, prop : string) {
    const props = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop);
    return props && typeof props.get === "function" ? props : false;
}

export function DataChanged(target : Target, prop : string) {
    DataChangedInternal(target, prop, new Set());
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

        if (!value.__target__) {
            value = propertyUpdated(target, prop, value as unknown as ProxyOrTarget)
            if (setter)
                setter(value);
        }
        ConnectContext(value);
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
                if (parentReferenceCount > 0)
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
        if (!child.__target__) {
            child = makeProxy(child as unknown as ProxyOrTarget);
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
