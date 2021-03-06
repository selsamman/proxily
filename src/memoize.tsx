import {getCurrentSelectorContext, Observer, setCurrentSelectorContext} from "./Observer";
import {ProxyTarget, Target} from "./proxyObserve";
import {memoReferenced} from "./proxy/proxyCommon";

/* Memoization is an object that memoizes a particular instance of a function, either a getter
   or a function with arguments.

   It creates an observer to monitor changes to any properties consumed during the execution of
   the function so it knows to schedule the function to be run next time it is called if they
   have changed.  It also remembers arguments and force the function to be run if they change.
   Only the previous value is remembered.
 */
export class Memoization {
    constructor(valueFunction: () => any, target : ProxyTarget, options : MemoizationOptions) {
        this.valueFunction = valueFunction;
        this.context = new Observer(()=>{
            if (this.options.preFetch)
                this.updateLastValue(undefined);
            else
                this.dependentsChanged = true;
        });
        this.options = options;
        this.proxyTarget = target;
    }
    options : MemoizationOptions;
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
        return this.options.resolver ? this.options.resolver(this.lastValue) : this.lastValue;
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
        const context = getCurrentSelectorContext() as Observer;
        setCurrentSelectorContext(this.context);
        this.lastValue = this.valueFunction.apply(this.proxyTarget, args);
        if (this.options.wrapper)
            this.lastValue = this.options.wrapper(this.lastValue);
        setCurrentSelectorContext(context);
        this.context.processPendingReferences();
    }
    cleanup () {
        this.context.cleanup();
    }
}




// Functions for declaring that a method is to be memoized.  Overloaded to be used as a decorator,
// on an object method or a class method (property provided as a string).  End result is storing
// the memoization options in the object's __memoizedProps__ keyed by the property name

export interface MemoizationOptions {
    wrapper : ((obj : any) => any) | undefined, // Can be used wrap the function (see suspendable)
    resolver : ((obj : any) => any) | undefined, // Can be used alter the result
    preFetch: boolean; // Fetch value as soon as dependent is changed (useful for suspendable)
}
const defaultMemoizationOptions : MemoizationOptions = {
    wrapper: undefined,
    resolver: undefined,
    preFetch : false
}


export function memoize<C>(obj?: {new(...args: any[]): C} | C , propOrProps? :  ((cls : C) => any) | string | Array<string>, options = defaultMemoizationOptions) {

    if (obj && propOrProps) {
        if ((obj as any).prototype && typeof propOrProps !== "function")
            memoizeClass(obj, propOrProps, options)
        else if ((obj as any).prototype && typeof propOrProps === "function")
            memoizeClassCB(obj as {new(...args: any[]): C}, propOrProps, options);
        else if (!(obj as any).prototype && typeof propOrProps === "function")
            memoizeObjCB(obj as C, propOrProps, options);
        else if(!(obj as any).prototype && typeof propOrProps !== "function")
            memoizeObject(obj, propOrProps, options)
    }
    return function (classPrototype: any, prop: string) {
        memoizeObject(classPrototype, prop, options);
    };
}

function memoizeObject (obj: any, propOrProps : string | Array<string>, options : MemoizationOptions) {
    const props = propOrProps instanceof Array ? propOrProps : [propOrProps];
    if (!obj.__memoizedProps__)
        Object.defineProperty(obj, '__memoizedProps__', {writable: true, enumerable: false, value: {}});
    props.map(prop => obj.__memoizedProps__[prop] = options);
}

function memoizeClass (cls : any, propOrProps : string | Array<string>, options : MemoizationOptions) {
    memoizeObject(cls.prototype, propOrProps, options);
}


function memoizeClassCB<C>(cls : {new(...args: any[]): C}, cb : (cls : C) => any, options = defaultMemoizationOptions) {
    const propertyDescriptors = Object.getOwnPropertyDescriptors(cls.prototype);
    const prop = cb(propertyDescriptors as unknown as C);
    memoizeClass(cls, prop.value ? prop?.value.name : prop.get.name.replace(/get /, ''), options);
}
function memoizeObjCB<C>(obj : C, cb : (cls : C) => any, options = defaultMemoizationOptions) {
    const propertyDescriptors = Object.getOwnPropertyDescriptors(obj);
    const prop = cb(propertyDescriptors as unknown as C);
    memoizeObject(obj, prop.value ? prop?.value.name : prop.get.name.replace(/get /, ''), options);
}
// Functions for for declaring that a getter method is suspendable.  Sugar around memoize

const defaultSuspendableOptions : MemoizationOptions = {
    wrapper: wrapPromiseForSuspense,
    resolver: (promise) => promise.read(),
    preFetch : false  // Set to true to begin fetch in event
}

export function suspendable<C>(obj?: {new(...args: any[]): C} | C , propOrProps? :  ((cls : C) => any) | string | Array<string>, options = {}) {
    return memoize(obj, propOrProps, {...defaultSuspendableOptions, ...options});
}

// Utility to determine if memoization was requested for a given property
export function isMemoized(prop: string, target: Target) {
    return target.__memoizedProps__ && target.__memoizedProps__.hasOwnProperty(prop);
}

// Create a new memoization which is a Memoization object in __memoContexts__ for the property
export function createMemoization (prop: string, target: Target, valueFunction: any) : Memoization | SnapshotGetterMemo{
    if (target.__memoizedProps__ && target.__memoizedProps__[prop] &&
        (!target.__memoContexts__ || !target.__memoContexts__[prop]))
    {
        if (!target.__memoContexts__)
            target.__memoContexts__ = {};
        const memo = new Memoization(valueFunction, target.__proxy__, target.__memoizedProps__[prop]);
        target.__memoContexts__[prop] = memo;

    } else
        memoReferenced(target.__memoContexts__[prop])
    return target.__memoContexts__[prop];
}

// When we create a snapshot for transitions the memoize value is constant since
// it cannot change by definition in a render and is only offered during a render
export class SnapshotGetterMemo {
    lastValue: any;
    options: any;
    constructor (value : Memoization | SnapshotGetterMemo) {
        this.lastValue = value.lastValue;
        this.options = value.options;
    }
    getValue() {
        return this.options.resolver ? this.options.resolver(this.lastValue) : this.lastValue;
    }
}

// Creat a new __memoContext__ with snapshot memos
export function getSnapshotMemos(target : Target) {
    const memoContext : { [key: string] : SnapshotGetterMemo} = {};
    for (let prop in target.__memoContexts__)
        memoContext[prop] = new SnapshotGetterMemo(target.__memoContexts__[prop]);
    return memoContext;
}

/* Wrap a promise, making it useable in <Suspense>
   - Create a new promise that will be used to resolve the final result
   - Return an object with a read function to return the actual result
   - If the result is not ready, read with throw the newly created promise
     which React knows to use to determine whether the render should be retried
   - Note that when used in the memoization, the resolver provided will
     execute the read function, returning the actual result if ready
 */
function wrapPromiseForSuspense (promise : any) {
    // shamelessly "cut and paste" from a gaeron's sandbox
    let status = "pending";
    let result : any;
    let suspender = promise.then(
        (r : any) => {
            status = "success";
            result = r;
        },
        (e : any) => {
            status = "error";
            result = e;
        }
    );
    return {
        read() {
            if (status === "pending") {
                throw suspender;
            } else if (status === "error") {
                throw result;
            } else if (status === "success") {
                return result;
            }
        }
    };
}
