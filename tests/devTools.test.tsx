import {configureReduxDevTools, initReduxDevTools, observable, Transaction} from "../src";
import {Root} from "./data/classes";
import "@testing-library/jest-dom/extend-expect";
import {addTransaction} from "../src/devTools";

const states : Array <any> = [];
let subscribe : Function;
(window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__ = {connect: () => ({
    send: (_name : string, state : any)  => states.push([name, state]),
    subscribe: ( callback : Function) => subscribe = callback,
    init: (state : any) => states.push(['@@init', state])
})}

class ExtendedRoot extends Root {
    actionP () {
        this.subActionP();
    }
    subActionP () {
        this.objectSingle.parent = this;
    }
    action () {
        this.objectSingle.num = 99;
    }
}

describe( "Can time travel using devTools", () => {
    it ("Can do simplest case", () => {
        configureReduxDevTools();
        const state1 = observable(new ExtendedRoot());
        const state2 = observable(new ExtendedRoot());
        initReduxDevTools();
        state1.action();
        state2.action();
        state2.actionP();
        expect(state2.objectSingle.parent).toBe(state2);
        expect(state1.objectSingle.num).toBe(99);
        expect(state2.objectSingle.num).toBe(99);
        expect(state2.objectSingle.parent).toBe(state2);
        expect(states.length).toBe(4);
        subscribe({payload: {actionId: 1}});
        expect(state1.objectSingle.num).toBe(99);  // State after first action
        expect(state2.objectSingle.num).toBe(3)
        expect(state2.objectSingle.parent).toBe(undefined);
        subscribe({payload: {actionId: 0}});
        expect(state1.objectSingle.num).toBe(3);  // State after first action
    });
    it ("Can time travel within a transaction1", () => {
        configureReduxDevTools();
        const txn = new Transaction({timePositioning: true});
        const state1d = observable(new ExtendedRoot());
        const state2d = observable(new ExtendedRoot());
        addTransaction(txn);
        const state1 = observable(state1d, txn);
        const state2 = observable(state2d, txn);
        initReduxDevTools();
        state1.action(); // 1
        state2.action(); // 2
        state2.actionP(); // 3
        expect(state2.objectSingle.parent).toBe(state2);
        expect(state1.objectSingle.num).toBe(99);
        expect(state2.objectSingle.num).toBe(99);

        txn.undo();
        txn.undo();
        txn.undo();
        expect(txn.canUndo).toBe(false);
        expect(state2.objectSingle.parent).toBe(undefined);
        expect(state1.objectSingle.num).toBe(3);
        expect(state2.objectSingle.num).toBe(3);
        subscribe({payload: {actionId: 1}}); // State after first action
        //expect(txn.canUndo).toBe(true);
        expect(state1.objectSingle.num).toBe(99);
        expect(state2.objectSingle.num).toBe(3)
        expect(state2.objectSingle.parent).toBe(undefined);

        txn.undo();
        expect(state1.objectSingle.num).toBe(3);
        expect(state2.objectSingle.num).toBe(3)
        expect(state2.objectSingle.parent).toBe(undefined);
        expect(txn.canUndo).toBe(false);
        subscribe({payload: {actionId: 2}}); // last state
        expect(state2.objectSingle.parent).toBe(undefined);
        expect(state1.objectSingle.num).toBe(99);
        expect(state2.objectSingle.num).toBe(99);
        expect(txn.canUndo).toBe(true);
        subscribe({payload: {actionId: 3}}); // last state
        expect(state2.objectSingle.parent).toBe(state2);
        expect(state1.objectSingle.num).toBe(99);
        expect(state2.objectSingle.num).toBe(99);
        expect(txn.canUndo).toBe(true);

    });
});
