import {persist, StorageEngine} from "../src";

class Leaf1 {
    num = 3;
    str = "foo"
    date = new Date();
    nul = null;
    parent : Root1;
}
class Root1 {
    collection1 = [new Leaf1(), new Leaf1()];
    collection2 = new Set([new Leaf1(), new Leaf1()]);
    collection3 = new Map([['1', new Leaf1()], ['2', new Leaf1()]]);
    collection4 = {'1': new Leaf1(), '2': new Leaf1()};
    leaf1 = new Leaf1();
    leaf2 = new Leaf1();
}

describe("storage tests", () => {
    it("Has basic sanity", async () => {
        let resolver : any;
        let item = {};
        const myStorage : StorageEngine = {
            getItem(key: string): any {
                return item[key];
            },
            setItem(key: string, value: any): any {
                item[key] = value;
                resolver(value);
            },
            removeItem(_key: string) {}
        }
        const pRoot = new Root1();
        const leaf = pRoot.collection3.get('2');
        if (leaf)
            leaf.parent = pRoot;
        const root = persist(pRoot, {storageEngine: myStorage});
        expect(root.collection3.get('2')?.parent).toBe(root)
        root.collection1[0].num = 4;
        await new Promise((resolve) => {resolver = resolve});
        const root2 = persist(new Root1(), {storageEngine: myStorage, classes: [Root1, Leaf1]});
        expect(root2.collection1[0].num).toBe(4)
        expect(root2.collection3.get('2')?.parent).toBe(root2)
    });
})
