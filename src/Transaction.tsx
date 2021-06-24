import {ProxyTarget} from "./proxyObserve";


export interface TransactionOptions {
    timePositioning: boolean
}

export class Transaction {

    constructor(options? : TransactionOptions) {
        if (options)
            this.options = options;

    }

    static defaultTransaction : Transaction | undefined;
    static defaultTransactionOptions : Partial<TransactionOptions> = {};

    static createDefaultTransaction () {
        if (Transaction.defaultTransaction)
            throw (new Error('createDefaultTransaction called twice'));
        Transaction.defaultTransaction = new Transaction ();
        return Transaction.defaultTransaction
    }

    // Private data
    private options: Partial<TransactionOptions> = {};
    private proxies : Map<ProxyTarget, ProxyTarget> = new Map();
    private undoredo: Array<[boolean, () => void, () => void]> = [];
    private _updateSequence = -1;

    // Public data
    get updateSequence () { return this._updateSequence }
    get timePositioning () {
        return this.options.timePositioning;
    }

    // Add next time position element indication whther top level and a function to repeat or undo state change
    addPosition (isTopLevel : boolean, undo: () => void,redo: () => void) {
        if (this._updateSequence < (this.undoredo.length - 1)) {
            this.undoredo.splice(this._updateSequence + 1, this.undoredo.length - this._updateSequence - 1);
        }
        this.undoredo.push([isTopLevel, undo, redo]);
        ++this._updateSequence;
    }

    // Undo last state update by executing undos until top level entry reached
    undo () {
        if (this._updateSequence < 0)
            throw new Error(`Cannot undo -  - updateSequence: ${this._updateSequence}`);
        while (this._updateSequence >= 0 && this.undoredo.length > 0) {
            const tasks = this.undoredo[this._updateSequence--];
            tasks[1].call(null);
            if (tasks[0])
                return;
        }
    }

    // Redo last state change (if previously undo executed) by executing redos until top level or end reached
    redo () {
        if (this.undoredo[this._updateSequence + 1])
            while (true) {
                const tasks = this.undoredo[++this._updateSequence];
                tasks[1].call(null);
                // End of undoredos or a new action
                if (!this.undoredo[this._updateSequence] || this.undoredo[this._updateSequence][0])
                    return;
            }
        else
            throw new Error(`Cannot redo -  - updateSequence: ${this._updateSequence}`);
    }

    // Roll to specific sequence by undoing redoing until point reached.
    rollTo(updateSequence : number) {
        // Point must exist and be top level call
        if (this.undoredo[this._updateSequence] || !this.undoredo[this._updateSequence][0])
            throw new Error(`Invalid passed on rollTo(${updateSequence}) - updateSequence: ${this._updateSequence}`);
        while (updateSequence > this._updateSequence)
            this.redo();
        while (updateSequence < this._updateSequence)
            this.undo();
    }

    // Add a new proxy to this transaction
    addProxy (proxy : ProxyTarget) {
       this.proxies.set(proxy, proxy);
    }

    // Rollback changes
    rollback () {

    }
}
