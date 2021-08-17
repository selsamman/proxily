import {ProxyTarget, Target} from "./proxyObserve";
import {log, logLevel} from "./log";
import {Transaction} from "./Transaction";
export let currentContext : Observer | undefined = undefined;
export let currentSelectorContext : Observer | undefined = undefined;
export function setCurrentSelectorContext (currentSelectorContextIn : Observer | undefined) {
    currentSelectorContext = currentSelectorContextIn;
}
export function setCurrentContext (currentContextIn : Observer | undefined) {
    currentContext = currentContextIn;
}

interface ObserverOptionsAll {
    batch: boolean,
    delay: number | undefined
}
export type ObserverOptions = Partial<ObserverOptionsAll>;

export class Observer {
    constructor(onChange : (target? : string, prop? : string, targetProxy? : ProxyTarget | Transaction) => void,
                options : ObserverOptions = {batch : true, delay: undefined}) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.onChange = onChange;
        this.options = options;
    }
    options: ObserverOptions;
    onChange : (target? : string, prop? : string, targetProxy? : ProxyTarget | Transaction) => void | undefined;
    connectedProxyTargets : Map<ProxyTarget | Transaction, {[index: string] : boolean}> = new Map();
    pendingProxyTargets : Array<[ProxyTarget | Transaction, string]> = new Array();

    target : Target | undefined;

    changed(proxyTarget : ProxyTarget | Transaction | undefined, prop : string) {
        if (!proxyTarget) {
            if (this.connectedProxyTargets.size > 0)
                this.onChange("*", "*");
            return
        }
        const connectedProxy = this.connectedProxyTargets.get(proxyTarget);
        if (connectedProxy)
            if (connectedProxy[prop] || connectedProxy['*']) {
                if(logLevel.render) log(`${proxyTarget}.${prop} forced re-render`);
                const name = proxyTarget instanceof Transaction ? "Transaction" :
                    proxyTarget.__target__.constructor ? proxyTarget.__target__.constructor.name :  "anonymous"
                this.scheduleChange(name, prop, proxyTarget);
            }
    };
    static inAction = false;
    static observersPendingChange : Set<Observer> = new Set();
    static startTopLevelCall () {
        Observer.inAction = true;
    }
    static endTopLevelCall () {
        Observer.inAction = false;
        Observer.observersPendingChange.forEach(observer => observer.effectChange())
        Observer.observersPendingChange.clear();
    }
    timeout : NodeJS.Timeout | undefined;
    scheduleChange(name : string, prop : string, proxyTarget: ProxyTarget | Transaction) {
        if (!this.options.batch)
            this.onChange(name, prop, proxyTarget);
        else if (Observer.inAction)
            Observer.observersPendingChange.add(this);
        else
            this.effectChange();
    }
    effectChange () {
        if (typeof this.options.delay === 'undefined')
            this.onChange();
        else {
            if (this.timeout)
                clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.onChange(), this.options.delay);
        }
    }
    referenced(proxyTarget : ProxyTarget | Transaction, prop : string) {
        this.pendingProxyTargets.push([proxyTarget, prop]);
    };
    processPendingReferences() {
        this.pendingProxyTargets.forEach(([target, prop]) =>
            this.processPendingReference(target, prop))
        this.pendingProxyTargets = new Array();
    }
    processPendingReference(proxyTarget : ProxyTarget | Transaction, prop : string) {
        let connectedProxy = this.connectedProxyTargets.get(proxyTarget)
        if (!connectedProxy) {
            connectedProxy = {}
            this.connectedProxyTargets.set(proxyTarget, connectedProxy);
            if (proxyTarget instanceof Transaction) {
                if (!proxyTarget.__contexts__.has(this))
                    proxyTarget.__contexts__.set(this, this);
            } else {
                if (!proxyTarget.__target__.__contexts__.has(this))
                    proxyTarget.__target__.__contexts__.set(this, this);
            }
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
