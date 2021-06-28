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
    private proxies : Map<ProxyTarget, ProxyTarget> = new Map();
    private undoredo: Array<Array<() => void>> = [];
    private _updateSequence = -1;
    private undoredoIntermediate : Array<() => void> = [];

    // Public data
    get updateSequence () { return this._updateSequence }
    get timePositioning () {
        return this.options.timePositioning;
    }
    withinProxy = false;
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
            recordTimePosition = false;
            try {target[key] = oldValue;}
            catch (e) {
                recordTimePosition = true;
                throw (e);
            }
            recordTimePosition = true;
        }

        function redo () {
            recordTimePosition = false;
            try {target[key] = newValue}
            catch (e) {
                recordTimePosition = true;
                throw (e);
            }
            recordTimePosition = true;
        }
        this.undoredoIntermediate.push(undo);
        this.undoredoIntermediate.push(redo);
        if (!this.withinProxy)
            this.addPosition(this.undoredoIntermediate);
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
            for (let ix = this.undoredo[this._updateSequence].length - 2; ix >= 0; ix -=2)
                this.undoredo[this._updateSequence][ix].call(null)
        else
            throw new Error(`Cannot undo -  - updateSequence: ${this._updateSequence}`);
        --this._updateSequence;
    }

    // Redo last state change (if previously undo executed) by executing redos until top level or end reached
    redo () {
        if (this.undoredo[this._updateSequence + 1]) {
            ++this._updateSequence;
            for (let ix = 1; ix < this.undoredo[this._updateSequence].length; ix += 2)
                this.undoredo[this._updateSequence][ix].call(null)
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
            this.proxies.set(proxy, proxy);
    }

    // Rollback changes by deleteing own properties of target restoring it to the base
    rollback () {
        if (this === Transaction.defaultTransaction)
            throw new Error(`Attempt to rollback the default transaction`);
        this.proxies.forEach(proxy => {
            const target = proxy.__target__;
            const newKeys = Object.getOwnPropertyNames(target);
            newKeys.forEach(key => delete target[key])
        });
    }

    // Rollback changes by deleteing own properties of target restoring it to the base
    commit () {
        if (this === Transaction.defaultTransaction)
            throw new Error(`Attempt to commit the default transaction`);
        this.proxies.forEach(proxy => {
            const target = proxy.__target__;
            const rootTarget = target.__parentTarget__;
            const newKeys = Object.getOwnPropertyNames(target);
            newKeys.forEach(key => {
                if (target[key] === undefined)
                    delete rootTarget[key];
                else
                    rootTarget[key] = target[key];
            });
        });
    }
}
