import {ProxyWrapper, Target} from "../ProxyWrapper";

export function getterProps(target : Target, prop : string) {
    const props = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(target), prop);
    return props && typeof props.get === "function" ? props : false;
}

export function DataChanged(proxy : ProxyWrapper, prop : string, originalProxy : ProxyWrapper) {

    // Notify contexts of the change
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
