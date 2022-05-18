import {Leaf, observeResult, Root} from "./classes";
import {observable} from "../../src";

describe("data structure tests: objects", () => {

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
            leafFromArray.num = 3
            expect(root.mapCollection.get('1')?.num).toBe(3);
        })).toBe("Root-mapCollection-3");

    });

    it ("can return actual value in setters", () => {
        const root = observable(new Root());
        expect(root.mapCollection.set("3", new Leaf()).get("3")?.str).toBe("foo");
    });


});
