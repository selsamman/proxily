import {Leaf, observeResult, Root} from "./classes";
import {proxy} from "../../src";

describe("data structure tests: objects", () => {


    // Array.prototype.includes() - Determines whether the array contains a value, returning true or false as appropriate.
    // Array.prototype.indexOf()- Returns the first (least) index of an element within the array equal to an element, or -1 if none is found.
    // Array.prototype.filter() - Returns a new array containing all elements of the calling array for which the provided filtering function returns true.
    // Array.prototype.find() -Returns the found element in the array, if some element in the array satisfies the testing function, or undefined if not found.
    // Array.prototype.findIndex() Returns the found index in the array, if an element in the array satisfies the testing function, or -1 if not found.
    // Array.prototype.lastIndexOf()- Returns the last (greatest) index of an element within the array equal to an element, or -1 if none is found.
    // Array.prototype.some() - Returns true if at least one element in this array satisfies the provided testing function.
    // Array.prototype.every() - Returns true if every element in this array satisfies the testing function.

    it ("can proxy search functions", () => {
        expect(observeResult(new Root(), (root) => {

            const leaf1 = new Leaf();
            const leafProxy1 = proxy(leaf1);
            root.arrayObjectCollection[1] = leaf1;
            expect(root.arrayObjectCollection[1]).toBe(leafProxy1);
            const leafProxy0 = root.arrayObjectCollection[0];

            expect (leaf1 instanceof Leaf).toBe(true);
            expect(leafProxy0 instanceof Leaf).toBe(true);

            expect(root.arrayObjectCollection.every((l, ix) => (ix === 0) ? l === leafProxy0 : l === leafProxy1)).toBe(true);
            expect(root.arrayObjectCollection.some(l => l === leafProxy0)).toBe(true);
            expect(root.arrayObjectCollection.some(l => l === leafProxy1)).toBe(true);

            expect(root.arrayObjectCollection.includes(leafProxy1)).toBe(true);
            expect(root.arrayObjectCollection.includes(leaf1)).toBe(false);

            expect(root.arrayObjectCollection.indexOf(leafProxy1)).toBe(1);
            expect(root.arrayObjectCollection.indexOf(leaf1)).toBe(-1);

            expect(root.arrayObjectCollection.lastIndexOf(leafProxy1)).toBe(1);
            expect(root.arrayObjectCollection.lastIndexOf(leaf1)).toBe(-1);

            expect(root.arrayObjectCollection.findIndex(l => l === leafProxy1)).toBe(1);
            expect(root.arrayObjectCollection.findIndex(l => l === leaf1)).toBe(-1);

            expect(root.arrayObjectCollection.find(l => l === leafProxy1)).toBe(leafProxy1);
            expect(root.arrayObjectCollection.find(l => l === leaf1)).toBe(undefined);

            expect(root.arrayObjectCollection.filter((l, ix) => (ix === 0) ? l === leafProxy0 : l === leafProxy1).length).toBe(2)

        })).toBe("Root-arrayObjectCollection-1");
    });



    // Array.prototype.entries() - Returns a new Array Iterator object that contains the key/value pairs for each index in the array.
    // Array.prototype.values() - Returns a new Array Iterator object that contains the values for each index in the array.
    // Array.prototype.keys() - Returns a new Array Iterator that contains the keys for each index in the array.
    // Array.prototype.forEach() - Calls a function for each element in the array.
    // Array.prototype[@@iterator]() - Returns a new Array Iterator object that contains the values for each index in the array.

    it ("can handles iterators", () => {

        expect(observeResult(new Root(), (root) => {
            const arrayIterator = root.arrayCollection.entries();
            expect(arrayIterator.next().value[1]).toBe(3);
            const leafIterator = root.arrayObjectCollection.entries();
            let leaf = leafIterator.next().value[1];
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const arrayIterator = root.arrayCollection.values();
            expect(arrayIterator.next().value).toBe(3);
            const leafIterator = root.arrayObjectCollection.values();
            let leaf = leafIterator.next().value;
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const arrayIterator = root.arrayCollection.keys();
            expect(root.arrayCollection[arrayIterator.next().value]).toBe(3);
            const leafIterator = root.arrayObjectCollection.keys();
            let leaf = root.arrayObjectCollection[leafIterator.next().value];
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const arr: any[]  = []
            root.arrayCollection.forEach((value, ix) => arr[ix] = value);
            expect(arr[0]).toBe(root.arrayCollection[0]);
            expect(arr[1]).toBe(root.arrayCollection[1]);

            const arrObj: Leaf[]  = []
            root.arrayObjectCollection.forEach((value, ix) => arrObj[ix] = value);
            expect(arrObj[0]).toBe(proxy(root.arrayObjectCollection[0]));
            expect(arrObj[1]).toBe(proxy(root.arrayObjectCollection[1]));
            let leaf = arrObj[1];
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-1");

    });

    it ("can handle arrays of various types", () => {

        expect(observeResult(new Root(), (root) => {
            expect(root.arrayArrayCollection.every(arrayEntry=> arrayEntry.every(entry => ++entry.num === 4))).toBe(true);
            const arrayIterator = root.arrayArrayCollection.entries();
            const leafIterator = arrayIterator.next().value[1].entries();
            const leaf = leafIterator.next().value[1];
            leaf.num = 4;
            const foo = root.arrayArrayCollection[0][0];
            expect(foo).toBe(leaf);
        })).toBe("Root-arrayArrayCollection-3");

        expect(observeResult(new Root(), (root) => {
            root.arrayMapCollection.every(arrayEntry=> arrayEntry.forEach(entry => ++entry.num));
            const arrayIterator = root.arrayMapCollection.entries();
            const map = arrayIterator.next().value[1];
            const leaf = map.get('1');
            leaf.num = 4;
            const foo = root.arrayMapCollection[0].get('1');
            expect(foo).toBe(leaf);
        })).toBe("Root-arrayMapCollection-3");

        expect(observeResult(new Root(), (root) => {
            root.arraySetCollection.every(arrayEntry=> arrayEntry.forEach(entry => ++entry.num));
            const arrayIterator = root.arraySetCollection.entries();
            const set = arrayIterator.next().value[1] as Set<any>;
            const leaf = Array.from(set)[0];
            leaf.num = 4;
            expect(root.arraySetCollection[0].has(leaf)).toBe(true);
        })).toBe("Root-arraySetCollection-3");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[0];
            if (leaf) {
                leaf.date.getDate();
                leaf.date.setMonth(1);
            } else
                expect(false).toBe(true);
        })).toBe("Root-arrayObjectCollection-1");
    });

    it ("can observe changes to arrays using index", () => {

        expect(observeResult(new Root(), (root) => {
            root.arrayCollection[0] = 3;
            root.arrayCollection[1] = 4;
        })).toBe("Root-arrayCollection-2");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[0];
            if (leaf)
                leaf.num = 4;
            expect(root.arrayObjectCollection[0].num).toBe(4);
            root.arrayObjectCollection[0] = new Leaf();
            expect(root.arrayObjectCollection[0].num).toBe(3);
        })).toBe("Root-arrayObjectCollection-2");

        expect(observeResult(new Root(), (root) => {
            delete root.arrayObjectCollection[0];
            expect(root.arrayObjectCollection[0]).toBe(undefined);
        })).toBe("Root-arrayObjectCollection-1");


    });
    // Array.prototype.fill() - Fills all the elements of an array from a start index to an end index with a static value.

    it ("can observe changes to arrays using fill", () => {

        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.arrayObjectCollection.fill(leaf, 1)
            expect(root.arrayObjectCollection[1]).toBe(leaf);
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.arrayObjectCollection.fill(leaf, 1);
            leaf.num = 3;
            expect(root.arrayObjectCollection[1]).toBe(leaf);
            root.arrayObjectCollection.fill(new Leaf(), 1)
            leaf.num = 4;
        })).toBe("Root-arrayObjectCollection-3");  // last assignment on unassigned leaf

        expect(observeResult(new Root(), (root) => {
            const leaf = proxy(new Leaf());
            root.arrayObjectCollection.fill(leaf, 0); // 1
            leaf.num = 4; // 2
            expect(root.arrayObjectCollection[0]).toBe(leaf);
            expect(root.arrayObjectCollection[1]).toBe(leaf);
            root.arrayObjectCollection.fill(new Leaf(), 1) //3
            expect(root.arrayObjectCollection[0]).toBe(leaf);
            leaf.num = 4; // 4
            root.arrayObjectCollection.fill(new Leaf(), 0) // 5
            leaf.num = 5; // leaf now orphaned
        })).toBe("Root-arrayObjectCollection-5");

    });

    it ("can observe changes to arrays on every side effects", () => {
        expect(observeResult(new Root(), (root) => {
            expect(root.arrayObjectCollection.every(entry => ++entry.num === 4)).toBe(true);
            const leaves = root.arrayObjectCollection.entries();
            const leaf = leaves.next().value[1];
            leaf.num = 5;
            expect(root.arrayObjectCollection[0]).toBe(leaf);
            expect(root.arrayObjectCollection[0].num).toBe(5);
        })).toBe("Root-arrayObjectCollection-3");
    });

    // Array.prototype.pop() - Removes the last element from an array and returns that element.
    // Array.prototype.push() - Adds one or more elements to the end of an array, and returns the new length of the array.
    // Array.prototype.unshift() - Adds one or more elements to the front of an array, and returns the new length of the array.
    // Array.prototype.shift() - Removes the first element from an array and returns that element.
    // Array.prototype.splice() - Adds and/or removes elements from an array.
    it ("can observe changes to arrays using mutable functions", () => {

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[1];
            expect(root.arrayObjectCollection.pop()?.num).toBe(3); // 1
            leaf.num = 5; // leaf an orphan now
            expect(root.arrayObjectCollection.length).toBe(1);
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[0];
            expect(root.arrayObjectCollection.shift()?.num).toBe(3); // 1
            leaf.num = 5; // leaf an orphan now
            expect(root.arrayObjectCollection.length).toBe(1);
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = new Leaf();
            expect(root.arrayObjectCollection.push(leaf)).toBe(3); // 1
            expect(root.arrayObjectCollection.length).toBe(3);
            expect(root.arrayObjectCollection[2]).toBe(proxy(leaf));
            root.arrayObjectCollection[2].num = 5; // leaf an orphan now
        })).toBe("Root-arrayObjectCollection-2");

        expect(observeResult(new Root(), (root) => {
            const leaf = new Leaf();
            expect(root.arrayObjectCollection.unshift(leaf)).toBe(3); // 1
            expect(root.arrayObjectCollection.length).toBe(3);
            expect(root.arrayObjectCollection[0]).toBe(proxy(leaf));
            root.arrayObjectCollection[0].num = 5; // leaf an orphan now
        })).toBe("Root-arrayObjectCollection-2");

        expect(observeResult(new Root(), (root) => {
            const leaf = new Leaf();
            const oldLeaf = root.arrayObjectCollection[1];
            expect(oldLeaf).toBe(proxy(oldLeaf));
            expect(root.arrayObjectCollection.splice(1, 1, leaf)[0]).toBe(proxy(oldLeaf)); // 1
            expect(root.arrayObjectCollection[1]).toBe(proxy(leaf));
            proxy(leaf).num = 5; //2
            proxy(oldLeaf).num = 5; // Orphan
        })).toBe("Root-arrayObjectCollection-2");

    });

    // Array.prototype.copyWithin() - Copies a sequence of array elements within the array.
    // Array.prototype.reverse() - Reverses the order of the elements of an array in place. (First becomes the last, last becomes first.)
    // Array.prototype.sort() - Sorts the elements of an array in place and returns the array.
    it ("can observe changes to arrays using internal manipulation functions", () => {

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[0];
            root.arrayObjectCollection.copyWithin(0, 1, 2)
            expect(root.arrayObjectCollection[0]).toBe(root.arrayObjectCollection[1]);
            leaf.num = 5; // leaf an orphan now
            root.arrayObjectCollection[0].num = 6;
        })).toBe("Root-arrayObjectCollection-2");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[0];
            leaf.num = 100;
            root.arrayObjectCollection.sort((a, b) => {
                expect(proxy(a)).toBe(a);expect(proxy(b)).toBe(b); return a.num - b.num});
            expect(root.arrayObjectCollection[1].num).toBe(100);
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const leaf = root.arrayObjectCollection[0];
            leaf.num = 100;
            root.arrayObjectCollection.reverse();
            expect(root.arrayObjectCollection[1].num).toBe(100);
        })).toBe("Root-arrayObjectCollection-1");

    });

    // Array.prototype.toLocaleString() - Returns a localized string representing the array and its elements. Overrides the Object.prototype.toLocaleString() method.
    // Array.prototype.toString() - Returns a string representing the array and its elements. Overrides the Object.prototype.toString() method.
    // Array.prototype.join() - Joins all elements of an array into a string.
    it ("stringify", () => {
        const root = new Root();
        expect(root.arrayObjectCollection.toString()).toBe(proxy(root).arrayObjectCollection.toString());
        expect(root.arrayObjectCollection.toLocaleString()).toBe(proxy(root).arrayObjectCollection.toLocaleString());
        expect(root.arrayObjectCollection.join()).toBe(proxy(root).arrayObjectCollection.join());
    });

    // Array.prototype.concat() - Returns a new array that is this array joined with other array(s) and/or value(s).
    // Array.prototype.map() - Returns a new array containing the results of calling a function on every element in this array.
    // Array.prototype.reduce() - Apply a function against an accumulator and each value of the array (from left-to-right) as to reduce it to a single value.
    // Array.prototype.reduceRight() - Apply a function against an accumulator> and each value of the array (from right-to-left) as to reduce it to a single value.
    // Array.prototype.slice() - Extracts a section of the calling array and returns a new array.
    it ("can observe changes to arrays using immutable functions", () => {

        expect(observeResult(new Root(), (root) => {
            const newRoot = new Root();
            const newArray = root.arrayObjectCollection.concat( newRoot.arrayObjectCollection);
            expect(newArray.length).toBe(4);
            expect(newArray[3]).toBe(proxy(newRoot.arrayObjectCollection[1]));
            const leaf = proxy(newRoot.arrayObjectCollection[0]) || new Leaf();
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-2");

        expect(observeResult(new Root(), (root) => {
            const newArray = root.arrayObjectCollection.map((leaf, ix) => {
                expect(leaf).toBe(proxy(root.arrayObjectCollection[ix])); return leaf});
            expect(newArray.length).toBe(2);
            const leaf = newArray[0] || new Leaf();
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-1");

        expect(observeResult(new Root(), (root) => {
            const newArray = root.arrayObjectCollection.slice(0, 1);
            const leaf = newArray[0] || new Leaf();
            expect(newArray.length).toBe(1);
            leaf.num = 5;
        })).toBe("Root-arrayObjectCollection-1");

        const root = proxy(new Root());
        expect(root.arrayObjectCollection.reduce((acc : number, leaf,ix) => proxy(leaf) === leaf ? acc + leaf.num * ix : -1, 0)).toBe(3);
        expect(root.arrayObjectCollection.reduceRight((acc : number, leaf,ix) => proxy(leaf) === leaf ? acc + leaf.num * ix : -1, 0)).toBe(3);

    });

})







