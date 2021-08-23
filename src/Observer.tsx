import {ProxyTarget, Target} from "./proxyObserve";
import {Transaction} from "./Transaction";
import {log, logLevel} from "./log";

// Maintain the current context as a global state.  This is the context that should be assigned any
// references detected by the proxy handlers
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
    delay: number | undefined,
    notifyParents : boolean
}
export type ObserverOptions = Partial<ObserverOptionsAll>;

const defaultObserverOptions = {
    batch : true,
    delay: undefined,
    notifyParents: false
}

// Observer is a subscription to changes in state
export class Observer {

    constructor(onChange : (target? : string, prop? : string, targetProxy? : ProxyTarget | Transaction) => void,
                options : ObserverOptions = defaultObserverOptions, componentName : string = "") {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        this.onChange = onChange;
        this.options = options;
        this.componentName = componentName;
    }

    options: ObserverOptions;
    onChange : (target? : string, prop? : string, targetProxy? : ProxyTarget | Transaction) => void | undefined;
    connectedProxyTargets : Map<ProxyTarget | Transaction, {[index: string] : boolean}> = new Map();
    pendingProxyTargets : Array<[ProxyTarget | Transaction, string]> = new Array();
    componentName = "";
    renderCount = 0;
    target : Target | undefined;

    // Proxies notify us here of changes
    changed(proxyTarget : ProxyTarget | Transaction | undefined, prop : string,  isParent : boolean) {
        if (isParent && !this.options.notifyParents)
            return;
        if (!proxyTarget) {
            if (this.connectedProxyTargets.size > 0)
                this.onChange("*", "*");
            return
        }
        const connectedProxy = this.connectedProxyTargets.get(proxyTarget);
        if (connectedProxy)
            if (connectedProxy[prop] || connectedProxy['*']) {
                const name = proxyTarget instanceof Transaction ? "Transaction" :
                    proxyTarget.__target__.constructor ? proxyTarget.__target__.constructor.name :  "anonymous"
                this.scheduleChange(name, prop, proxyTarget);
            }
    };

    // Changes are batched up if they occur in the process of processing an action

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

    // Handle the immediate notification of deferral and batching

    scheduleChange(name : string, prop : string, proxyTarget: ProxyTarget | Transaction) {
        if (!this.options.batch) // no batching means immediate notification
            this.onChange(name, prop, proxyTarget);
        else if (Observer.inAction) // batch up changes that occur in an action
            Observer.observersPendingChange.add(this);
        else
            this.effectChange();
    }

    // notify immediately or schedule timeout
    effectChange () {
        if (typeof this.options.delay === 'undefined')
            this.onChange();
        else {
            if (this.timeout)
                clearTimeout(this.timeout);
            this.timeout = setTimeout(() => this.onChange(), this.options.delay);
        }
    }

    // Proxies notify us here of references.  This is a two stage process where "candidate" references
    // remain pending until explicityly processed usually when useEffect fires.  The pending mechanism
    // deals with Reacts extra renders designed to weed out side effects.

    referenced(proxyTarget : ProxyTarget | Transaction, prop : string) {
        this.pendingProxyTargets.push([proxyTarget, prop]);
    };
    processPendingReferences() {
        const logging : Array<string>= [];
        this.pendingProxyTargets.forEach(([target, prop]) =>
            this.processPendingReference(target, prop, logging))
        this.pendingProxyTargets = new Array();
        if (logLevel.propertyTracking)
            log((this.componentName ? this.componentName + " " : "") + "Observer" + " tracking " + logging.join(", "));
    }
    processPendingReference(proxyTarget : ProxyTarget | Transaction, prop : string, logging : Array<string>) {
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
        if (!(proxyTarget instanceof Transaction) && logLevel.propertyTracking && prop !== "*" && !connectedProxy[prop]) {
            const target = proxyTarget.__target__
            logging.push((target.constructor ? target.constructor.name : "Object") + "." + prop);
        }
        connectedProxy[prop] = true;
    };

    // cleanup and shutdown needed to lose references to proxies so unused objects can be
    // garbage collected.  cleanup generally called when a component unmounts.  disconnect called
    // when a proxy detects an orphaned reference

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
