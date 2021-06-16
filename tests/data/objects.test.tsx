import {Leaf, observeResult, Root} from "./classes";

describe("data structure tests: objects", () => {

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

    it ("only reacts to referenced properties", () => {

        expect(observeResult(
            new Root(),
            (root) => {
                root.objectSingle.str = "Foo";
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
                root.objectSingle = new Leaf();
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


});
