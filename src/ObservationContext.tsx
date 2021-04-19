import {ConnectedProxy, ProxyWrapper} from "./ProxyWrapper";
import {log, logLevel} from "./log";
export let currentContext : ObservationContext | undefined = undefined;
export let currentSelectorContext : ObservationContext | undefined = undefined;
export function setCurrentSelectorContext (currentSelectorContextIn : ObservationContext | undefined) {
    currentSelectorContext = currentSelectorContextIn;
}
export function setCurrentContext (currentContextIn : ObservationContext | undefined) {
    currentContext = currentContextIn;
}
export class ObservationContext {
    constructor(onChange : (target : string, prop : string) => void) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.onChange = onChange;
    }
    onChange : (target : string, prop : string) => void | undefined;
    connectedProxies : Map<ProxyWrapper, ConnectedProxy> = new Map();
    proxy : ProxyWrapper | undefined;

    changed(proxy: ProxyWrapper, target : string, prop : string) {
        if (this.connectedProxies.get(proxy)?.referencedProps[prop as any]) {
            if(logLevel.render) log(`${target}.${prop} forced re-render`);
            this.onChange(target, prop);
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
export function ConnectContext (proxy : ProxyWrapper) {
    if(currentContext) {
        proxy.__contexts__.set(currentContext, currentContext);
        currentContext.connect(proxy);
    }
    if(currentSelectorContext) {
        proxy.__contexts__.set(currentSelectorContext, currentSelectorContext);
        currentSelectorContext.connect(proxy);
    }
}
