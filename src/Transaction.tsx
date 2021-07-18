import {ProxyTarget, Target} from "./proxyObserve";
import {currentContext, currentSelectorContext, ObservationContext} from "./ObservationContext";

export interface TransactionOptions {
    timePositioning: boolean
}
let recordTimePosition = true;

export class Transaction {

    constructor(options? : TransactionOptions) {
        if (options)
            this.options = options;
     }

    static defaultTransaction : Transaction | undefined;
    static defaultTransactionOptions : Partial<TransactionOptions> = {};

    static createDefaultTransaction (options? : TransactionOptions) {
        if (Transaction.defaultTransaction)
            return Transaction.defaultTransaction;
        Transaction.defaultTransaction = new Transaction (options);
        return Transaction.defaultTransaction
    }

    // Private data
    private options: Partial<TransactionOptions> = {};
    private proxies : Map<ProxyTarget, Set<any>> = new Map();
    private undoredo: Array<Array<() => void>> = [];
    private _updateSequence = -1;
    private undoredoIntermediate : Array<() => void> = [];

    // Public data
    get updateSequence () { return this._updateSequence }
    private set updateSequence (updateSequence) {
        this._updateSequence = updateSequence;
        this.notifyContext();
    }
    get timePositioning () {
        return this.options.timePositioning;
    }
    isDefault () {
        return this === Transaction.defaultTransaction;
    }

    withinProxy = false;
    withinUndoRedo = false;

    startTopLevelCall () {
        this.undoredoIntermediate = [];
        this.withinProxy = true;
    }

    endTopLevelCall () {
        if (this.undoredoIntermediate.length > 0)
            this.addPosition(this.undoredoIntermediate);
        this.undoredoIntermediate = [];
        this.withinProxy = false;
    }

    recordTimePosition(target : Target, key : any, oldValue: any, newValue : any) {
        if (!recordTimePosition || !this.timePositioning)
            return;
        function undo () {
            target.__proxy__[key] = oldValue;
        }
        function redo () {
            target.__proxy__[key] = newValue
        }
        this.recordUndoRedo(undo, redo);
    }

    recordUndoRedo(undo : () => void, redo: () => void) {
        if (!this.withinUndoRedo) {
            this.undoredoIntermediate.push(undo);
            this.undoredoIntermediate.push(redo);
            if (!this.withinProxy) {
                this.addPosition(this.undoredoIntermediate);
                this.undoredoIntermediate = [];
            }
        }
    }

    // Add next time position element indication whther top level and a function to repeat or undo state change
    addPosition (undoredoIntermediate :  Array<() => void>) {
        if (this.updateSequence < (this.undoredo.length - 1)) {
            this.undoredo.splice(this.updateSequence + 1, this.undoredo.length - this.updateSequence - 1);
        }
        this.undoredo.push(undoredoIntermediate);
        ++this.updateSequence;
    }

    // Undo last state update by executing undos until top level entry reached
    undo () {
        if (this.undoredo[this.updateSequence])
            for (let ix = this.undoredo[this.updateSequence].length - 2; ix >= 0; ix -=2) {
                this.withinUndoRedo = true;
                try {this.undoredo[this.updateSequence][ix].call(null)}
                catch (e) {
                    this.withinUndoRedo = false;
                    throw(e);
                }
                this.withinUndoRedo = false;
            }
        else
            throw new Error(`Cannot undo -  - updateSequence: ${this.updateSequence}`);
        --this.updateSequence;
    }


    // Redo last state change (if previously undo executed) by executing redos until top level or end reached
    redo () {
        if (this.undoredo[this.updateSequence + 1]) {
            ++this.updateSequence;
            for (let ix = 1; ix < this.undoredo[this.updateSequence].length; ix += 2) {
                this.withinUndoRedo = true;
                try {this.undoredo[this.updateSequence][ix].call(null)}
                catch (e) {
                    this.withinUndoRedo = false;
                    throw(e);
                }
                this.withinUndoRedo = false;
            }
        } else
            throw new Error(`Cannot redo -  - updateSequence: ${this.updateSequence}`);
    }

    clearUndoRedo () {
        this.undoredo = new Array<Array<() => void>>();
        this.updateSequence = -1;
    }

    // Roll to specific sequence by undoing redoing until point reached.
    rollTo(updateSequence : number) {
        while (updateSequence > this.updateSequence)
            this.redo();
        while (updateSequence < this.updateSequence)
            this.undo();
    }

    // Used internally to indicate a property of an object has been changed
    setDirty (proxy : ProxyTarget, key : any) {
        if (this !== Transaction.defaultTransaction) {
            let keys = this.proxies.get(proxy);
            if (!keys) {
                keys = new Set();
                this.proxies.set(proxy, keys);
            }
            keys.add(key);
        }
    }
    // Rollback changes by deleteing own properties of target restoring it to the base
    rollback () {
        if (this === Transaction.defaultTransaction)
            throw new Error(`Attempt to commit the default transaction`);
        this.proxies.forEach((keys, proxy) => {
            const rootProxy = proxy.__target__.__parentTarget__.__proxy__;
            if (keys.size) {
                if (proxy instanceof Map) {
                    (proxy as unknown as Map<any, any>).clear();
                    (rootProxy as unknown as Map<any, any>).forEach( (value, key) =>
                        (proxy.__target__ as unknown as Map<any, any>).set(key, value));
                } else if (proxy instanceof Set) {
                    (proxy as unknown as Set<any>).clear();
                    (rootProxy as unknown as Set<any>).forEach( key =>
                        (proxy.__target__ as unknown as Set<any>).add(key));
                } else if (rootProxy instanceof Date)
                    (proxy as unknown as Date).setTime((rootProxy as unknown as Date).getTime());
                else if (proxy instanceof Array) {
                    (proxy as unknown as Array<any>).splice(0, (proxy as unknown as Array<any>).length);
                    for (var ix = 0; ix < (proxy as unknown as Array<any>).length; ++ix)
                        (proxy.__target__ as unknown as Array<any>)[ix] = (rootProxy as unknown as Array<any>)[ix];
                } else
                    keys.forEach(key => {
                        proxy[key] = rootProxy[key];
                    });
            }
        });
        this.proxies = new Map();
        this.clearUndoRedo();
    }
    // Rollback changes by deleteing own properties of target restoring it to the base
    commit () {
        if (this === Transaction.defaultTransaction)
            throw new Error(`Attempt to commit the default transaction`);
        this.proxies.forEach((keys, proxy) => {
            const rootProxy = proxy.__target__.__parentTarget__.__proxy__;
            if (!rootProxy) throw new Error("Hissy Fit");
            if (keys.size) {
                if (proxy instanceof Map) {
                    (rootProxy as unknown as Map<any, any>).clear();
                    (proxy as unknown as Map<any, any>).forEach( (value, key) =>
                        (rootProxy.__target__ as unknown as Map<any, any>).set(key, value));
                } else if (proxy instanceof Set) {
                    (rootProxy as unknown as Set<any>).clear();
                    (proxy as unknown as Set<any>).forEach( key =>
                        (rootProxy.__target__ as unknown as Set<any>).add(key));
                } else if (proxy instanceof Date)
                    (rootProxy as unknown as Date).setTime((proxy as unknown as Date).getTime());
                else if (proxy instanceof Array) {
                    (rootProxy as unknown as Array<any>).splice(0, (rootProxy as unknown as Array<any>).length);
                    for (var ix = 0; ix < (proxy as unknown as Array<any>).length; ++ix)
                        (rootProxy.__target__ as unknown as Array<any>)[ix] = (proxy as unknown as Array<any>)[ix];
                } else
                    keys.forEach(key => {
                        if (proxy[key] === undefined)
                            delete rootProxy[key];
                        else
                            rootProxy[key] = proxy[key];

                    });
            }
        });
        this.proxies = new Map();
        this.clearUndoRedo();
    }
    get canUndo () {
        this.referenceContext()
        return !!this.undoredo[this.updateSequence]
    }
    get canRedo () {
        this.referenceContext()
        return !!this.undoredo[this.updateSequence + 1]
    }

    referenceContext () {
        if(currentContext)
            currentContext.referenced(this, "__undo__");
        if(currentSelectorContext)
            currentSelectorContext.referenced(this, "__undo__");
    }
    notifyContext () {
        this.__contexts__.forEach(context => {
            context.changed(this,  "__undo__");
        });
    }
    __contexts__ : Map<ObservationContext, ObservationContext> = new Map();  // A context that can communicate with the component

}
