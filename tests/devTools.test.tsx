import {configureReduxDevTools, initReduxDevTools, makeObservable} from "../src";
import {Root} from "./data/classes";
import "@testing-library/jest-dom/extend-expect";

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
    it ("Can do simplist case", () => {
        configureReduxDevTools();
        const state1 = makeObservable(new ExtendedRoot());
        const state2 = makeObservable(new ExtendedRoot());
        initReduxDevTools();
        state1.action();
        state2.action();
        state2.actionP();
        expect(state2.objectSingle.parent).toBe(state2);
        expect(state1.objectSingle.num).toBe(99);
        expect(state2.objectSingle.num).toBe(99);
        expect(states.length).toBe(4);
        subscribe({payload: {actionId: 1}});
        expect(state1.objectSingle.num).toBe(99);  // State after first action
        expect(state2.objectSingle.num).toBe(3)
        expect(state2.objectSingle.parent).toBe(undefined);
        subscribe({payload: {actionId: 0}});
        expect(state1.objectSingle.num).toBe(3);  // State after first action
    });
});
