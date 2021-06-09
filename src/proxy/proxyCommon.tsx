import {makeProxy, proxies, ProxyWrapper, Target} from "../ProxyWrapper";
import {currentContext, currentSelectorContext} from "../ObservationContext";

export function getterProps(target : Target, prop : string) {
    const props = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop);
    return props && typeof props.get === "function" ? props : false;
}

export function DataChanged(proxy : ProxyWrapper, prop : string) {
    DataChangedInternal(proxy, prop, new Set());
}

export function DataChangedInternal(proxy : ProxyWrapper, prop : string, history : Set<ProxyWrapper>) {

    // Notify contexts of the change
    proxy.__contexts__.forEach(context => {
        context.changed(proxy, proxy.__target__.constructor.name, prop);
    });

    // Pass notification up the chain of references
    proxy.__parents__.forEach(parent => {
        if (history.has(parent.proxy))
            return;
        history.add(parent.proxy)
        for(const prop in parent.props)
            DataChangedInternal(parent.proxy, prop, history);
    });
}
export function proxyMissing (target : Target, prop: string) : ProxyWrapper{
    throw(new Error(`ERROR: ${target.constructor.name}.${prop} missing ProxyWrapper`));
}


export function propertyReferenced(proxyWrapper : ProxyWrapper, prop: any) : void {
    if(currentContext)
        currentContext.referenced(proxyWrapper, prop);
    if(currentSelectorContext)
        currentSelectorContext.referenced(proxyWrapper, prop);
    lastReference.set(proxyWrapper, prop);
}
/*
    Handle references to objects by keeping the __references__ in the ProxyWrapper up-to-date.
    This includes removing references when
 */
export function updateObjectReference(proxyWrapper : ProxyWrapper, prop: any, value? : Target) : Target | undefined {

    // Get proxyWrapper for previous object referenced
    const oldObject = proxyWrapper.__references__.get(prop);

    // Ignore if we are replacing with same
    if (oldObject && oldObject !== value && oldObject) {

        // Unlink previously referenced object parent link to this object
        const oldObjectProxyWrapper = proxies.get(oldObject);
        if (oldObjectProxyWrapper) {
            const parentProxyWrapper = oldObjectProxyWrapper.__parents__.get(proxyWrapper);
            if (parentProxyWrapper)  {
                // Remove parent this particular prop from parent reference
                delete parentProxyWrapper.props[prop];
                // Remove parent reference if empty
                if (Object.keys(parentProxyWrapper.props).length === 0) {
                    oldObjectProxyWrapper.__parents__.delete(proxyWrapper);
                    // If now parentless remove weak refererence to wrapper and disconnect from context
                    if (oldObjectProxyWrapper.__parents__.size === 0) {
                        proxies.delete(oldObject);
                        oldObjectProxyWrapper.__contexts__.forEach(context => context.disconnect(oldObjectProxyWrapper))
                    }
                }
            }
        }
    }

    // Proxify object and update reference in associated proxyWrapper
    if (typeof value === "object") {
        value = makeProxy(value,  prop, proxyWrapper)
    } else
        proxyWrapper.__references__.delete(prop);

    return value;
}
export function deProxy(target : Target | undefined) : Target | undefined {
    const proxyWrapper = proxies.get(target !== undefined ? target['__target__'] || target : target);
    return proxyWrapper ? proxyWrapper.__target__ : target;
}
export function proxyMapOrSetElements(mapOrSet : Map<any, any> | Set<any>, proxyWrapper: ProxyWrapper) {
    mapOrSet.forEach( (value : any, key : any) => {
        value = proxyWrapper.__references__.get(key) || value;
        if (typeof value === "object") {
            value = makeProxy(value,  key, proxyWrapper);
            proxyWrapper.__references__.set(key === undefined ? value : key, value)
        }
        proxyWrapper.__contexts__.forEach(context => context.referenced(proxyWrapper, key));
        lastReference.set(proxyWrapper, key);
    });
}
export function proxySet(set : Set<any>, proxyWrapper: ProxyWrapper) {
    const proxySet = new Set();
    set.forEach( (value : any) => {
        value = proxyWrapper.__references__.get(value) || value;
        if (typeof value === "object") {
            value = makeProxy(value,  value, proxyWrapper);
            proxyWrapper.__references__.set(value, value)
        }
        proxySet.add(value);
        proxyWrapper.__contexts__.forEach(context => context.referenced(proxyWrapper, value));
        lastReference.set(proxyWrapper, value);
    });
    return proxySet
}
export interface LastReference {
    prop : string;
    proxyWrapper : ProxyWrapper | undefined;
    set: (target : any, prop : string) => void;
    clear: () => void;
}

export const lastReference : LastReference = {
    prop : "",
    proxyWrapper : undefined,
    set: function (proxy : ProxyWrapper, prop : string) : void {
        this.proxyWrapper = proxy;
        this.prop = prop;
    },
    clear: function () : void {
        this.proxyWrapper = undefined;
        this.prop = "";
    }
}
