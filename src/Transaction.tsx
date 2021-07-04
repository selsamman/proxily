import {ProxyTarget, Target} from "./proxyObserve";

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
            throw (new Error('createDefaultTransaction called twice'));
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
    get timePositioning () {
        return this.options.timePositioning;
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
            target[key] = oldValue;
        }
        function redo () {
            target[key] = newValue
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
        if (this._updateSequence < (this.undoredo.length - 1)) {
            this.undoredo.splice(this._updateSequence + 1, this.undoredo.length - this._updateSequence - 1);
        }
        this.undoredo.push(undoredoIntermediate);
        ++this._updateSequence;
    }

    // Undo last state update by executing undos until top level entry reached
    undo () {
        if (this.undoredo[this._updateSequence])
            for (let ix = this.undoredo[this._updateSequence].length - 2; ix >= 0; ix -=2) {
                this.withinUndoRedo = true;
                try {this.undoredo[this._updateSequence][ix].call(null)}
                catch (e) {
                    this.withinUndoRedo = false;
                    throw(e);
                }
                this.withinUndoRedo = false;
            }
        else
            throw new Error(`Cannot undo -  - updateSequence: ${this._updateSequence}`);
        --this._updateSequence;
    }

    // Redo last state change (if previously undo executed) by executing redos until top level or end reached
    redo () {
        if (this.undoredo[this._updateSequence + 1]) {
            ++this._updateSequence;
            for (let ix = 1; ix < this.undoredo[this._updateSequence].length; ix += 2) {
                this.withinUndoRedo = true;
                try {this.undoredo[this._updateSequence][ix].call(null)}
                catch (e) {
                    this.withinUndoRedo = false;
                    throw(e);
                }
                this.withinUndoRedo = false;
            }
        } else
            throw new Error(`Cannot redo -  - updateSequence: ${this._updateSequence}`);
    }

    // Roll to specific sequence by undoing redoing until point reached.
    rollTo(updateSequence : number) {
        while (updateSequence > this._updateSequence)
            this.redo();
        while (updateSequence < this._updateSequence)
            this.undo();
    }

    // Add a new proxy to this transaction
    addProxy (proxy : ProxyTarget) {
        if (this !== Transaction.defaultTransaction)
            this.proxies.set(proxy, new Set());
    }

    setDirty (proxy : ProxyTarget, key : any) {
        if (this !== Transaction.defaultTransaction) {
            const keys = this.proxies.get(proxy);
            if (keys)
                keys.add(key);
        }
    }
/*
    // Rollback changes by deleteing own properties of target restoring it to the base
    rollback () {
        if (this === Transaction.defaultTransaction)
            throw new Error(`Attempt to rollback the default transaction`);
        this.proxies.forEach(proxy  => {
            const target = makeProxy(proxy).__target__;
            const newKeys = Object.keys(target).filter(p => target.hasOwnProperty(p));
            newKeys.forEach(key => delete target[key])
        });
    }
*/
    // Rollback changes by deleteing own properties of target restoring it to the base
    commit () {
        if (this === Transaction.defaultTransaction)
            throw new Error(`Attempt to commit the default transaction`);
        this.proxies.forEach((keys, proxy) => {
            const rootProxy = proxy.__target__.__parentTarget__.__proxy__;
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
    }
}
