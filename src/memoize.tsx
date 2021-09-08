import {currentSelectorContext, Observer, setCurrentSelectorContext} from "./Observer";
import {ProxyTarget, Target} from "./proxyObserve";


export class GetterMemo {
    constructor(valueFunction: () => any, target : ProxyTarget) {
        this.valueFunction = valueFunction;
        this.context = new Observer(()=>{
            this.dependentsChanged = true
        });
        this.proxyTarget = target;
    }
    lastArgumentValues = [];
    proxyTarget: ProxyTarget
    lastValue: any;
    dependentsChanged = true;
    context: Observer;
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
        const context = currentSelectorContext as Observer;
        setCurrentSelectorContext(this.context);
        this.lastValue = this.valueFunction.apply(this.proxyTarget, args);
        setCurrentSelectorContext(context);
        this.context.processPendingReferences();
    }
    cleanup () {
        this.context.cleanup();
    }
}

export function memoize(obj?: any, propOrProps? : string | Array<string>) {
    if (obj && propOrProps) {
        if (obj.prototype)
            memoizeClass(obj, propOrProps)
        else
            memoizeObject(obj, propOrProps)
    }
    return function (classPrototype: any, prop: string) {
        memoizeObject(classPrototype, prop);
    };
}

function memoizeObject (obj: any, propOrProps : string | Array<string>) {
    const props = propOrProps instanceof Array ? propOrProps : [propOrProps];
    if (!obj.__memoizedProps__)
        obj.__memoizedProps__ = {};
    props.map(prop => obj.__memoizedProps__[prop] = true);
}

function memoizeClass (cls : any, propOrProps : string | Array<string>) {
    memoizeObject(cls.prototype, propOrProps);
}

export function isMemoized(prop: string, target: Target) {
    return target.__memoizedProps__ && target.__memoizedProps__.hasOwnProperty(prop);
}

export function createMemoization (prop: string, target: Target, valueFunction: any) : GetterMemo | SnapshotGetterMemo{
    if (target.__memoizedProps__ && target.__memoizedProps__[prop] &&
        (!target.__memoContexts__ || !target.__memoContexts__[prop]))
    {
        if (!target.__memoContexts__)
            target.__memoContexts__ = {};
        const memo = new GetterMemo(valueFunction, target.__proxy__);
        target.__memoContexts__[prop] = memo;

    }
    return target.__memoContexts__[prop];
}

// When we create a snapshot for transitions the memoize value is constant since
// it cannot change by definition in a render and is only offered during a render
export class SnapshotGetterMemo {
    lastValue: any
    constructor (value : any) {
        this.lastValue = value;
    }
    getValue() {
        return this.lastValue;
    }
}

// Creat a new __memoContext__ with snapshot memos
export function getSnapshotMemos(target : Target) {
    const memoContext : { [key: string] : SnapshotGetterMemo} = {};
    for (let prop in target.__memoContexts__)
        memoContext[prop] = new SnapshotGetterMemo(target.__memoContexts__[prop].lastValue);
    return memoContext;
}
