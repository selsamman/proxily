import {ProxyTarget, Target} from "./proxyObserve";
import {Transaction} from "./Transaction";
import {log, logLevel} from "./log";
import {Memoization} from "./memoize";

// Maintain the current context as a global state.  This is the context that should be assigned any
// references detected by the proxy handlers
let currentContext : Observer | undefined = undefined;
let currentSelectorContext : Observer | undefined = undefined;
export function setCurrentSelectorContext (currentSelectorContextIn : Observer | undefined) {
    currentSelectorContext = currentSelectorContextIn;
}
export function setCurrentContext (currentContextIn : Observer | undefined) {
    currentContext = currentContextIn;
}

export const getCurrentContext = () => currentContext;
export const getCurrentSelectorContext = () => currentSelectorContext;

interface ObserverOptionsAll {
    batch: boolean,
    delay: number | undefined,
    notifyParents : boolean,
    memo: boolean,  // only used in observer()
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
    isSuspended = false;
    options: ObserverOptions;
    onChange : (target? : string, prop? : string, targetProxy? : ProxyTarget | Transaction) => void | undefined;
    connectedProxyTargets : Map<ProxyTarget | Transaction, {[index: string] : boolean}> = new Map();
    pendingProxyTargets : Array<[ProxyTarget | Transaction, string]> = [];
    componentName = "";
    renderCount = 0;
    target : Target | undefined;

    // Proxies notify us here of changes
    changed(proxyTarget : ProxyTarget | Transaction | undefined, prop : string,  isParent : boolean) {
        if (this.isSuspended)
            return;
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

    static forceBatch = false;
    static beginBatch () {
        Observer.forceBatch = true;
    }
    static playBatch (clear = false) {
        const toCall = Array.from(Observer.observersPendingChange)
        if (clear)
            Observer.observersPendingChange.clear();
        toCall.forEach(observer => observer.effectChange());
        if (clear)
            Observer.forceBatch = false;
    }
    static inAction = false;
    static observersPendingChange : Set<Observer> = new Set();
    static startTopLevelCall () {
        Observer.inAction = true;
    }
    static endTopLevelCall () {

        Observer.inAction = false;
        const toCall = Array.from(Observer.observersPendingChange)
        Observer.observersPendingChange.clear();
        toCall.forEach(observer => observer.effectChange())
    }
    timeout : NodeJS.Timeout | undefined;

    // Handle the immediate notification of deferral and batching

    scheduleChange(name : string, prop : string, proxyTarget: ProxyTarget | Transaction) {
        if (Observer.forceBatch)
            Observer.observersPendingChange.add(this);
        else if (!this.options.batch) // no batching means immediate notification
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

    referencedMemo( memo : Memoization) {
        memo.context.connectedProxyTargets.forEach((connectedProxy, proxyTarget) => {
            for (let prop in connectedProxy)
                this.referenced(proxyTarget, prop)
        })
    }
    processPendingReferences() {
        const logging : Array<string>= [];
        this.pendingProxyTargets.forEach(([target, prop]) =>
            this.processPendingReference(target, prop, logging))
        this.pendingProxyTargets = [];
        if (logLevel.propertyTracking && logging.length > 0 && this.componentName)
            log(this.componentName + " Observer" + " tracking " + logging.join(", "));
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
