import {
    ConnectContext,
    currentSelectorContext,
    ObservationContext,
    setCurrentSelectorContext
} from "./ObservationContext";
import {ProxyWrapper, Target} from "./ProxyWrapper";

export class GetterMemo {
    constructor(valueFunction: () => any, proxy : ProxyWrapper) {
        this.valueFunction = valueFunction;
        this.context = new ObservationContext(()=>{
            this.dependentsChanged = true
        });
        this.proxyWrapper = proxy;
    }
    lastArgumentValues = [];
    proxyWrapper: ProxyWrapper
    lastValue: any;
    dependentsChanged = true;
    context: ObservationContext;
    valueFunction: () => any;
    closureFunction : any;
    getValue (args : any) {
        if (this.dependentsChanged || this.argsChanged(args)) {
            this.updateLastValue(args);
            this.lastArgumentValues = args;
            this.dependentsChanged = false;
        }
        return this.lastValue;
    }
    argsChanged (args : any) {
        let changed = false;
        args.map((arg : any, ix : number) => {
            if (this.lastArgumentValues[ix] !== arg)
                changed = true;
        });
        return changed;
    }
    updateLastValue (args : any) {
        const context = currentSelectorContext as ObservationContext;
        setCurrentSelectorContext(this.context);
        this.lastValue = this.valueFunction.apply(this.proxyWrapper.__proxy__, args);
        setCurrentSelectorContext(context);
    }
    connectProxy(proxyWrapper : ProxyWrapper) {
        const context = currentSelectorContext as ObservationContext;
        setCurrentSelectorContext(this.context);
        ConnectContext(proxyWrapper);
        setCurrentSelectorContext(context);
    }
    cleanup () {
        this.context.cleanup();
    }
}
export function memoizeObject (obj: any, propOrProps : string | Array<string>) {
    const props = propOrProps instanceof Array ? propOrProps : [propOrProps];
    if (!obj.__memoizedProps__)
        obj.__memoizedProps__ = {};
    props.map(prop => obj.__memoizedProps__[prop] = true);
}
export function memoizeClass (cls : any, propOrProps : string | Array<string>) {
    memoizeObject(cls.prototype, propOrProps);
}
export function memoize() {
    return function (classPrototype: any, prop: string) {
        memoizeObject(classPrototype, prop);
    };
}
export function isMemoized(prop: string, target: Target) {
    return target.__memoizedProps__ && target.__memoizedProps__[prop];
}
export function CreateMemoization (prop: string, target: Target, proxyWrapper: ProxyWrapper, valueFunction: any) : GetterMemo {
    if (target.__memoizedProps__ && target.__memoizedProps__[prop] &&
        (!proxyWrapper.__memoContexts__ || !proxyWrapper.__memoContexts__[prop]))
    {
        if (!proxyWrapper.__memoContexts__)
            proxyWrapper.__memoContexts__ = {};
        const memo = new GetterMemo(valueFunction, proxyWrapper);
        memo.connectProxy(proxyWrapper);
        proxyWrapper.__memoContexts__[prop] = memo;

    }
    return proxyWrapper.__memoContexts__[prop];
}
