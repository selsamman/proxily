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
    function observeResult<T>(root : T, action : (obj : T) => void, observer? : (obj : T) => void) {
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

    it ("only reacts to referenced properties", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                root.objectSingle = new Leaf();
            },
            (root) => root.objectSingle
        )).toBe("Root-objectSingle-1");
        expect(observeResult(
            new Root(),
            (root) => {
                root.objectSingle.str = "Foo";
                root.objectSingle = new Leaf();
            },
            (root) => root.objectCollection
        )).toBe("--0");

        expect(observeResult(
            new Root(),
            (root) => {
                root.objectSingle.str = "Foo";
            },
            (root) => root.objectSingle
        )).toBe("Root-objectSingle-1");

    });
    it ("reacts to all simple object types", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                expect(root.objectSingle instanceof Leaf).toBe(true);
                const previousLeaf = root.objectSingle;
                root.objectSingle = new Leaf();
                expect(previousLeaf !== root.objectSingle) .toBe(true)
                const leaf = root.objectSingle;
                expect(leaf.num).toBe(3);
                expect(leaf.str).toBe("foo");
                expect(leaf.date.getTime() <= (new Date()).getTime()).toBe(true)
            },
            (root) => root.objectSingle
        )).toBe("Root-objectSingle-1");
    });

    it ("can observe changes to arrays", () => {
        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.arrayCollection.fill(leaf, 1)
            expect(root.arrayCollection[1]).toBe(leaf);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            expect(root.arrayCollection.every(entry => entry.num === 3)).toBe(true);
            const leaves = root.arrayCollection.entries();
            const leaf = leaves.next().value[1];
            leaf.num = 4;
            expect(root.arrayCollection[0]).toBe(leaf);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.arrayCollection.fill(leaf, 1)
            expect(root.arrayCollection[1]).toBe(leaf);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayCollection[0];
            if (leaf)
                leaf.num = 4;
            expect(root.arrayCollection[0].num).toBe(4);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            expect(root.arrayCollection.pop()?.num).toBe(3);
        })).toBe("Root-arrayCollection-1");

        expect(observeResult(new Root(), (root) => {
            delete root.arrayCollection[0];
            expect(root.arrayCollection[0]).toBe(undefined);
        })).toBe("Root-arrayCollection-1");

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
            const leaf = proxy(new Leaf());
            root.arrayCollection.fill(leaf, 1)
            expect(root.arrayCollection[1]).toBe(leaf);
        })).toBe("Root-arrayCollection-1");

    });

    it ("can observe changes to objects", () => {

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
            // @ts-ignore
            expect(root.objectCollection.c instanceof Leaf).toBe(true);
            // @ts-ignore
            root.objectCollection.c = new Leaf();
            // @ts-ignore
            expect(root.objectCollection.c instanceof Leaf).toBe(true);
        })).toBe("Root-objectCollection-2");
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

        expect(observeResult(new Root(), (root) => {
            root.mapCollection.set('3', new Leaf());
            const leaf = root.mapCollection.get('3')
            if (leaf) {
                leaf.num = 4;
            } else
                expect(false).toBe(true);
            expect(root.mapCollection.size).toBe(3);
            expect(root.mapCollection.get('3')?.num).toBe(4);
        })).toBe("Root-mapCollection-2");

        expect(observeResult(new Root(), (root) => {
            root.mapCollection.forEach((value, key) => value.num = parseInt(key));
            const asArray = Array.from(root.mapCollection);
            expect(asArray[0][0]).toBe("1");
            const leafFromArray = asArray[0][1];
            expect(leafFromArray.num).toBe(1);
            expect(root.mapCollection.get('2')?.num).toBe(2);
        })).toBe("Root-mapCollection-2");
    });
    it ("can observe changes to sets", () => {

        expect(observeResult(new Root(), (root) => {
            const newLeaf = proxy(new Leaf());
            root.setCollection.add(newLeaf);
            newLeaf.num = 4;
            expect(root.setCollection.has(newLeaf)).toBe(true);
            expect(root.setCollection.size).toBe(3);
        })).toBe("Root-setCollection-2");

        expect(observeResult(new Root(), (root) => {
            root.setCollection.forEach(value => value.num = 4);
            expect(Array.from(root.setCollection)[0].num).toBe(4);
            expect(Array.from(root.setCollection)[1].num).toBe(4);
        })).toBe("Root-setCollection-2");

        expect(observeResult(new Root(), (root) => {
            const asArray = Array.from(root.setCollection)
            root.setCollection.delete(asArray[0]);
            expect(root.setCollection.size).toBe(1);
        })).toBe("Root-setCollection-1");

    });
});
