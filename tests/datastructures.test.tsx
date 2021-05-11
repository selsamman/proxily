import {proxy} from "../src";

describe("data structure tests of proxy", () => {
    class Leaf {
        num = 3;
        str = "foo"
        date = new Date();
        nul = null;
        parent : Root;
    }
    class Root {
        collection1 = [new Leaf(), new Leaf()];
        collection2 = new Set([new Leaf(), new Leaf()]);
        collection3 = new Map([['1', new Leaf()], ['2', new Leaf()]]);
        collection4 = {'1': new Leaf(), '2': new Leaf()};
        leaf1 = new Leaf();
        leaf2 = new Leaf();
    }

    it ("can handlex complex structures", () => {
        const root = proxy(new Root());
        const leaf = root.collection3.get('1');
        if (leaf)
            leaf.parent = root;
        else
            expect(true).toBe(false);
    });
});
