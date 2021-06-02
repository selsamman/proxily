import {observe, proxy} from "../src";

describe("data structure tests of proxy", () => {
    class Leaf {
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
    class Root {
        arrayCollection = [new Leaf(), new Leaf()];
        setCollection = new Set([new Leaf(), new Leaf()]);
        mapCollection = new Map([['1', new Leaf()], ['2', new Leaf()]]);
        objectCollection = {a: new Leaf(), b: new Leaf()};
        objectSingle = new Leaf();
    }

    // Harness to observe a change to property and return the name of the property as <class>-<prop>-<observation-count>
    let reactions = 0;
    let observedObj;
    let observedProp;
    function observeResult<T>(root : T, action : (obj : T) => void, observer? : any) {
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

    it ("reacts to all simple object types", () => {
        expect(observeResult(new Root(), (root) => {
            expect(root.objectSingle instanceof Leaf).toBe(true);
            const previousLeaf = root.objectSingle;
            root.objectSingle = new Leaf();
            expect(previousLeaf !== root.objectSingle) .toBe(true)
            const leaf = root.objectSingle;
            expect(leaf.num).toBe(3);
            expect(leaf.str).toBe("foo");
            expect(leaf.date.getTime() <= (new Date()).getTime()).toBe(true)
        })).toBe("Root-objectSingle-1");
    });

    it ("can observe changes to arrays", () => {

        expect(observeResult(new Root(), (root) => {
            delete root.arrayCollection[0];
            expect(root.arrayCollection[0]).toBe(undefined);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayCollection[0];
            if (leaf) {
                leaf.date.getDate();
                leaf.date.setMonth(1);
            } else
                expect(false).toBe(true);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            expect(root.arrayCollection.pop() instanceof Leaf).toBe(true);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.arrayCollection.fill(leaf, 1)
            expect(root.arrayCollection[1]).toBe(leaf);
        })).toBe("Root-arrayCollection-1");
    });

    it ("can observe changes to maps", () => {

        expect(observeResult(new Root(), (root) => {
            const leaf = root.objectCollection.a;
            if (leaf)
                leaf.parent = root
        })).toBe("Root-objectCollection-1");

        expect(observeResult(new Root(), (root) => {
            // @ts-ignore
            delete root.objectCollection.a;
            expect(root.objectCollection.a).toBe(undefined);
        })).toBe("Root-objectCollection-1");

        expect(observeResult(new Root(), (root) => {
            // @ts-ignore
            root.objectCollection.c = new Leaf();
            expect(root.objectCollection.a instanceof Leaf).toBe(true);
        })).toBe("Root-objectCollection-1");
    });
    it ("can observe changes to maps", () => {

        expect(observeResult(new Root(), (root) => {
            const leaf = root.mapCollection.get('1');
            if (leaf)
                leaf.parent = root
        })).toBe("Root-mapCollection-1");

        expect(observeResult(new Root(), (root) => {
            root.mapCollection.delete('1');
            expect(root.mapCollection.size).toBe(1);
        })).toBe("Root-mapCollection-1");

        expect(observeResult(new Root(), (root) => {
            root.mapCollection.set('3', new Leaf());
            expect(root.mapCollection.size).toBe(3);
        })).toBe("Root-mapCollection-1");
    });
    it ("can observe changes to sets", () => {

        expect(observeResult(new Root(), (root) => {
            root.setCollection.add(new Leaf());
            expect(root.setCollection.size).toBe(3);
        })).toBe("Root-setCollection-1");

        expect(observeResult(new Root(), (root) => {
            root.setCollection.delete(Array.from(root.setCollection)[0]);
            expect(root.setCollection.size).toBe(1);
        })).toBe("Root-setCollection-1");

    });
});
