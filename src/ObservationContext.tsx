import {ProxyTarget, Target} from "./proxyObserve";
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
    constructor(onChange : (target : string, prop : string, targetProxy : ProxyTarget) => void) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.onChange = onChange;
    }
    onChange : (target : string, prop : string, targetProxy : ProxyTarget) => void | undefined;
    connectedProxyTargets : Map<ProxyTarget, {[index: string] : boolean}> = new Map();
    target : Target | undefined;

    changed(proxyTarget : ProxyTarget, prop : string) {
        const connectedProxy = this.connectedProxyTargets.get(proxyTarget);
        if (connectedProxy)
            if (connectedProxy[prop] || connectedProxy['*']) {
                if(logLevel.render) log(`${proxyTarget}.${prop} forced re-render`);
                this.onChange(proxyTarget.__target__.constructor ? proxyTarget.__target__.constructor.name :  "anonymous", prop, proxyTarget);
            }
    };
    referenced(proxyTarget : ProxyTarget, prop : string) {
        let connectedProxy = this.connectedProxyTargets.get(proxyTarget)
        if (!connectedProxy) {
            connectedProxy ={}
            this.connectedProxyTargets.set(proxyTarget, connectedProxy)
        }
        connectedProxy[prop] = true;
    };
    connect (_proxyTarget : ProxyTarget) {
        //this.connectedProxyTargets.set(proxyTarget, {});
    }
    disconnect (proxyTarget: ProxyTarget) {
        this.connectedProxyTargets.delete(proxyTarget);
    }
    cleanup () {
        // Allow Context to be garbage collected
        this.connectedProxyTargets.forEach((_crap, proxyTarget) => {
            if (proxyTarget.__target__.__contexts__.get(this))
                proxyTarget.__target__.__contexts__.delete(this)
        });
        this.connectedProxyTargets = new Map();
    }

}
/*
Connect this proxyWrapper to the current context (in an observer).
 */
export function connectToContext (proxyTarget : ProxyTarget, context? : ObservationContext) {
    if(currentContext && !proxyTarget.__target__.__contexts__.has(currentContext)) {
        proxyTarget.__target__.__contexts__.set(currentContext, currentContext);
        currentContext.connect(proxyTarget);
    }
    if(currentSelectorContext && !proxyTarget.__target__.__contexts__.has(currentSelectorContext)) {
        proxyTarget.__target__.__contexts__.set(currentSelectorContext, currentSelectorContext);
        currentSelectorContext.connect(proxyTarget);
    }
    if(context && !proxyTarget.__target__.__contexts__.has(context)) {
        proxyTarget.__target__.__contexts__.set(context, context);
        context.connect(proxyTarget);
    }
}

