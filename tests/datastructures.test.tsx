import {observe, proxy, setLogLevel} from "../src";

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
        collection1 = [new Leaf(), new Leaf()];
        collection2 = new Set([new Leaf(), new Leaf()]);
        collection3 = new Map([['1', new Leaf()], ['2', new Leaf()]]);
        collection4 = {'1': new Leaf(), '2': new Leaf()};
        leaf1 = new Leaf();
        leaf2 = new Leaf();
    }

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

    it ("can observe changes at top level to all data types", () => {
/*
        expect(observeResult(new Root(), (root) => {
            console.log(typeof root.collection1[0]);
            delete root.collection1[0];
            expect(root.collection1[0]).toBe(undefined);
        })).toBe("Root-collection1-1");
*/
        setLogLevel({propertyReference: true});
        expect(observeResult(new Root(), (root) => {
            const leaf = root.collection1[0];
            if (leaf) {
                leaf.date.getDate();
                leaf.date.setMonth(1);
            } else
                expect(false).toBe(true);
        })).toBe("Root-collection1-1");

        expect(observeResult(new Root(), (root) => {
            expect(root.collection1.pop() instanceof Leaf).toBe(true);
        })).toBe("Root-collection1-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.collection1.fill(leaf, 1)
            expect(root.collection1[1]).toBe(leaf);
        })).toBe("Root-collection1-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.collection3.get('1');
            if (leaf)
                leaf.parent = root
        })).toBe("Root-collection3-1");

        expect(observeResult(new Root(), (root) => {
            root.collection3.delete('1');
            expect(root.collection3.size).toBe(1);
        })).toBe("Root-collection3-1");

        expect(observeResult(new Root(), (root) => {
            root.collection3.set('3', new Leaf());
            expect(root.collection3.size).toBe(3);
        })).toBe("Root-collection3-1");

        expect(observeResult(new Root(), (root) => {
            root.collection2.add(new Leaf());
            expect(root.collection2.size).toBe(3);
        })).toBe("Root-collection2-1");

        expect(observeResult(new Root(), (root) => {
            root.collection2.delete(Array.from(root.collection2)[0]);
            expect(root.collection2.size).toBe(1);
        })).toBe("Root-collection2-1");

    });
});
