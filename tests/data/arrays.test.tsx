import {Leaf, observeResult, Root} from "./classes";
import {proxy} from "../../src";

describe("data structure tests: objects", () => {

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
            const foo = root.arrayCollection[0];
            expect(foo).toBe(leaf);
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



})
