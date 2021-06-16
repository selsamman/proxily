import {observe, proxy} from "../../src";

export class Leaf {
    constructor (val? : number | undefined) {
        if (val)
            this.num = val
    }
    num = 3;
    str = "foo"
    date = new Date();
    nul = null;
    parent : Root | undefined;
}
export class Root {
    arrayCollection = [new Leaf(), new Leaf()];
    setCollection = new Set([new Leaf(), new Leaf()]);
    mapCollection = new Map([['1', new Leaf()], ['2', new Leaf()]]);
    objectCollection = {a: new Leaf(), b: new Leaf()};
    objectSingle = new Leaf();
}

// Harness to observe a change to property and return the name of the property as <class>-<prop>-<observation-count>
export let reactions = 0;
let observedObj;
let observedProp;
export function observeResult<T>(root : T, action : (obj : T) => void, observer? : (obj : T) => void) {
    reactions = 0;
    observedProp = "";
    observedObj = "";
    const context = observe (root, reactor, observer)
    action(proxy(root) as T)
    context.cleanup();
    return `${observedObj}-${observedProp}-${reactions}`;
    function reactor (obj : string, prop : string) {
        ++reactions;
        observedObj = obj;
        observedProp = prop;
    }
}
