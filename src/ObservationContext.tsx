import {ProxyTarget, Target} from "./proxyObserve";
import {log, logLevel} from "./log";
import {Transaction} from "./Transaction";
export let currentContext : ObservationContext | undefined = undefined;
export let currentSelectorContext : ObservationContext | undefined = undefined;
export function setCurrentSelectorContext (currentSelectorContextIn : ObservationContext | undefined) {
    currentSelectorContext = currentSelectorContextIn;
}
export function setCurrentContext (currentContextIn : ObservationContext | undefined) {
    currentContext = currentContextIn;
}

export class ObservationContext {
    constructor(onChange : (target : string, prop : string, targetProxy : ProxyTarget | Transaction) => void) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.onChange = onChange;
    }
    onChange : (target : string, prop : string, targetProxy : ProxyTarget | Transaction) => void | undefined;
    connectedProxyTargets : Map<ProxyTarget | Transaction, {[index: string] : boolean}> = new Map();
    pendingProxyTargets : Array<[ProxyTarget | Transaction, string]> = new Array();

    target : Target | undefined;

    changed(proxyTarget : ProxyTarget | Transaction, prop : string) {
        const connectedProxy = this.connectedProxyTargets.get(proxyTarget);
        if (connectedProxy)
            if (connectedProxy[prop] || connectedProxy['*']) {
                if(logLevel.render) log(`${proxyTarget}.${prop} forced re-render`);
                const name = proxyTarget instanceof Transaction ? "Transaction" :
                    proxyTarget.__target__.constructor ? proxyTarget.__target__.constructor.name :  "anonymous"
                this.onChange(name, prop, proxyTarget);
            }
    };
    referenced(proxyTarget : ProxyTarget | Transaction, prop : string) {
        this.pendingProxyTargets.push([proxyTarget, prop]);
    };
    processPendingReferences() {
        this.pendingProxyTargets.forEach(([target, prop]) => this.processPendingReference(target, prop))
        this.pendingProxyTargets = new Array();
    }
    processPendingReference(proxyTarget : ProxyTarget | Transaction, prop : string) {
        let connectedProxy = this.connectedProxyTargets.get(proxyTarget)
        if (!connectedProxy) {
            connectedProxy = {}
            this.connectedProxyTargets.set(proxyTarget, connectedProxy);
            if (proxyTarget instanceof Transaction)
                proxyTarget.__contexts__.set(this, this);
            else
                proxyTarget.__target__.__contexts__.set(this, this);
        }
        connectedProxy[prop] = true;
    };

    disconnect (proxyTarget: ProxyTarget) {
        this.connectedProxyTargets.delete(proxyTarget);
    }
    cleanup () {
        // Allow Context to be garbage collected
        this.connectedProxyTargets.forEach((_crap, proxyTarget) => {
            if (proxyTarget instanceof Transaction) {
                if (proxyTarget.__contexts__.get(this))
                    proxyTarget.__contexts__.delete(this)

            } else {
                if (proxyTarget.__target__.__contexts__.get(this))
                    proxyTarget.__target__.__contexts__.delete(this)
            }
        });
        this.connectedProxyTargets = new Map();
    }

}
