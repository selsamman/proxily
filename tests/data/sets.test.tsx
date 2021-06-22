import {Leaf, observeResult, Root} from "./classes";
import {proxy} from "../../src";

describe("data structure tests: objects", () => {
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
