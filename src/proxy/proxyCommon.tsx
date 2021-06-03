import {makeProxy, proxies, ProxyWrapper, Target} from "../ProxyWrapper";

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
export function updateObjectReference(proxyWrapper : ProxyWrapper, prop: any, value? : any) : Target {

    // Get proxyWrapper for previous object referenced
    const oldObject = proxyWrapper.__references__.get(prop);

    if (oldObject && oldObject !== value) {

        const oldObjectProxyWrapper = proxies.get(oldObject);
        if (oldObjectProxyWrapper) {
            // Unlink previous object from it's parents
            const parentProxyWrapper = oldObjectProxyWrapper.__parents__.get(proxyWrapper);
            if (parentProxyWrapper)  {
                delete parentProxyWrapper.props[prop];
                if (Object.keys(parentProxyWrapper.props).length === 0) {
                    oldObjectProxyWrapper.__parents__.delete(proxyWrapper);
                    if (oldObjectProxyWrapper.__parents__.size === 0)
                        oldObjectProxyWrapper.__contexts__.forEach(context => context.disconnect(proxyWrapper))
                }
            }
        }
    }

    // Update reference
    if (typeof value === "object") {
        value = makeProxy(value,  prop, proxyWrapper)
        proxyWrapper.__references__.set(prop, value);
    } else
        proxyWrapper.__references__.delete(prop);

    return value;
}

export function proxyMapOrSetElements(target : Map<any, any> | Set<any>, proxyWrapper: ProxyWrapper) {
    target.forEach( (key : any, referenceTarget : any) => {
        referenceTarget = proxyWrapper.__references__.get(key) || referenceTarget;
        if (typeof referenceTarget === "object" && !referenceTarget.__target__) {
            referenceTarget = makeProxy(referenceTarget,  key, proxyWrapper);
            referenceTarget = proxyWrapper.__references__.set(key, referenceTarget);
        }
        proxyWrapper.__contexts__.forEach(context => context.referenced(proxyWrapper, key));
        lastReference.set(proxyWrapper, key, referenceTarget);
    });
}

export interface LastReference {
    value: Object;
    prop : string;
    proxyWrapper : ProxyWrapper | undefined;
    set: (target : any, prop : string, value : any) => void;
    clear: () => void;
}

export const lastReference : LastReference = {
    value: {},
    prop : "",
    proxyWrapper : undefined,
    set: function (proxy : ProxyWrapper, prop : string, value : any) : void {
        this.proxyWrapper = proxy;
        this.prop = prop;
        this.value = value;
    },
    clear: function () : void {
        this.proxyWrapper = undefined;
        this.prop = "";
        this.value = {};
    }
}
