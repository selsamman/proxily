import {observable, Transaction} from "../../src";
import {Leaf, observeResult, Root} from "../data/classes";

describe("transation unit tests plane objects", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.objectSingle.str = "Foo";
                expect(root.objectSingle.str).toBe("foo");
            }
        )).toBe("--0");
    });
    it ("can commit changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.objectSingle.str = "Foo";
                transaction.commit();
                expect(root.objectSingle.str).toBe("Foo");
            }
        )).toBe("Root-objectSingle-1");
    });
    it ("can commit changes with delete", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                // @ts-ignore
                delete tRoot.objectSingle.str;
                //expect(tRoot.objectSingle.hasOwnProperty("str")).toBe(false);
                expect(root.objectSingle.str).toBe("foo");
                expect(root.objectSingle.hasOwnProperty("str")).toBe(true);
                transaction.commit();
                expect(root.objectSingle.hasOwnProperty("str")).toBe(false);
            }
        )).toBe("Root-objectSingle-1");
    });

   it ("can rollback changes", () => {
       expect(observeResult(
           new Root(),
           (root) => {
               const transaction = new Transaction();
               const tRoot = observable(root, transaction)
               tRoot.objectSingle.str = "Foo";
               transaction.rollback();
               expect(root.objectSingle.str).toBe("foo");
               expect(tRoot.objectSingle.str).toBe("foo");
           }
       )).toBe("--0");
   });

   it ("can commit changes with delete", () => {
       expect(observeResult(
           new Root(),
           (root) => {
               const transaction = new Transaction();
               const tRoot = observable(root, transaction)
               // @ts-ignore
               delete tRoot.objectSingle.str;
               expect(root.objectSingle.str).toBe("foo");
               expect(root.objectSingle.hasOwnProperty("str")).toBe(true);
               transaction.rollback();
               expect(root.objectSingle.str).toBe("foo");
               expect(root.objectSingle.hasOwnProperty("str")).toBe(true);
               expect(tRoot.objectSingle.str).toBe("foo");
               expect(tRoot.objectSingle.hasOwnProperty("str")).toBe(true);
           }
       )).toBe("--0");
   });

});
describe("transaction unit tests arrays", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.arrayObjectCollection[0].str = "Foo";
                root.arrayObjectCollection[1].str = "Foo";
                expect(root.arrayObjectCollection[0].str).toBe("foo");
                expect(tRoot.arrayObjectCollection[1].str).toBe("Foo");
            }
        )).toBe("Root-arrayObjectCollection-1");
    });
    it ("can commit changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.arrayObjectCollection[0].str = "Foo";
                root.arrayObjectCollection[1].str = "Foo";
                expect(root.arrayObjectCollection[0].str).toBe("foo");
                expect(tRoot.arrayObjectCollection[1].str).toBe("Foo");

                tRoot.arrayObjectCollection.push(new Leaf( 67));
                expect(root.arrayObjectCollection[2]).toBe(undefined);
                transaction.commit();
                expect(root.arrayObjectCollection[2].num).toBe(67);
                expect(root.arrayObjectCollection[0].str).toBe("Foo");
                expect(root.arrayObjectCollection[1].str).toBe("Foo");
                expect(tRoot.arrayObjectCollection[0].str).toBe("Foo");
                expect(tRoot.arrayObjectCollection[1].str).toBe("Foo");
            }
        )).toBe("Root-arrayObjectCollection-3");
    });

    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.arrayObjectCollection[0].str = "Foo";
                expect(tRoot.arrayObjectCollection[0].str).toBe("Foo");
                tRoot.arrayObjectCollection.push(new Leaf( 67));
                transaction.rollback();
                expect(tRoot.arrayObjectCollection[2]).toBe(undefined);
                expect(tRoot.arrayObjectCollection[0].str).toBe("foo");
            }
        )).toBe("--0");
    });

});

describe("transaction unit tests maps", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.mapCollection.set('1', new Leaf(99));
                expect(root.mapCollection.get('1')?.num).toBe(3);
                expect(tRoot.mapCollection.get('1')?.num).toBe(99);
            }
        )).toBe("--0");
    });
    it ("can commit changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction);
                root.mapCollection.delete('1'); // 1

                // Create new string of objects to hang off txn
                const newLeaf = new Leaf(99);
                newLeaf.parent = new Root();
                newLeaf.parent.objectSingle.num = 98;
                tRoot.mapCollection.set('1', newLeaf);

                expect(root.mapCollection.get('1')?.num).toBe(undefined);

                transaction.commit(); // 2

                expect(root.mapCollection.get('1')?.parent?.objectSingle.num).toBe(98);

                let rootLeaf = root.mapCollection.get('1');
                if (rootLeaf) {
                    rootLeaf.num = 89; // 3
                    let rootParent = rootLeaf.parent;
                    if (rootParent)
                        rootParent.objectSingle.num = 88; // 4
                }

                expect(root.mapCollection.get('1')?.parent?.objectSingle.num).toBe(88);
                expect(tRoot.mapCollection.get('1')?.parent?.objectSingle.num).toBe(88);

                let tRootLeaf = tRoot.mapCollection.get('1');
                if (tRootLeaf) {
                    tRootLeaf.num = 79; // 4
                    let tRootParent = tRootLeaf.parent;
                    if (tRootParent)
                        tRootParent.objectSingle.num = 78; // 5
                }
                expect(root.mapCollection.get('1')?.parent?.objectSingle.num).toBe(88);
                expect(tRoot.mapCollection.get('1')?.parent?.objectSingle.num).toBe(78);

                transaction.commit();

                expect(tRoot.mapCollection.get('1')?.parent?.objectSingle.num).toBe(78);
                expect(root.mapCollection.get('1')?.parent?.objectSingle.num).toBe(78);
            }
        )).toBe("Root-mapCollection-6");
    });

    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction)
                tRoot.mapCollection.set('1', new Leaf(99));
                expect(root.mapCollection.get('1')?.num).toBe(3);
                expect(tRoot.mapCollection.get('1')?.num).toBe(99);
                transaction.rollback();
                expect(tRoot.mapCollection.get('1')?.num).toBe(3);
                expect(root.mapCollection.get('1')?.num).toBe(3);
            }
        )).toBe("--0");
    });

});
describe("transaction unit tests sets", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction);
                const newLeaf = new Leaf(99)
                tRoot.setCollection.add(newLeaf);
                expect(root.setCollection.has(newLeaf)).toBe(false);
                expect(tRoot.setCollection.has(newLeaf)).toBe(true);
            }
        )).toBe("--0");
    });
    it ("can commit changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction);
                const newLeaf = new Leaf(88)
                tRoot.setCollection.add(newLeaf);
                expect(root.setCollection.size).toBe(2);
                expect(tRoot.setCollection.has(newLeaf)).toBe(true);
                transaction.commit();
                expect(root.setCollection.size).toBe(3);
                expect(Array.from(root.setCollection).find(e => e ? e.num === 88 : false)?.num).toBe(88);
                const newLeaf2 = new Leaf(99)
                tRoot.setCollection.add(newLeaf2);
                expect(root.setCollection.size).toBe(3);
                transaction.commit();
                expect(root.setCollection.size).toBe(4);
                expect(Array.from(root.setCollection).find(e => e ? e.num === 99 : false)?.num).toBe(99);;
            }
        )).toBe("Root-setCollection-2");
    });

    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = observable(root, transaction);
                const newLeaf = new Leaf(99)
                tRoot.setCollection.add(newLeaf);
                expect(root.setCollection.has(newLeaf)).toBe(false);
                expect(tRoot.setCollection.has(newLeaf)).toBe(true);
                transaction.rollback();
                expect(tRoot.setCollection.size).toBe(2);
            }
        )).toBe("--0");
    });

});

describe("transaction unit tests dates", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                root.objectSingle.date.setMonth(0, 1);
                const tRoot = observable(root, transaction)
                tRoot.objectSingle.date.setMonth(1, 1);
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
            }
        )).toBe("Root-objectSingle-1");
    });
    it ("can commit changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                root.objectSingle.date.setMonth(0, 1);
                const tRoot = observable(root, transaction)
                tRoot.objectSingle.date.setMonth(1, 1);
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
                transaction.commit();
                expect(root.objectSingle.date.getMonth()).toBe(1);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
            }
        )).toBe("Root-objectSingle-2");
    });

    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                root.objectSingle.date.setMonth(0, 1);
                const tRoot = observable(root, transaction)
                tRoot.objectSingle.date.setMonth(1, 1);
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
                transaction.rollback();
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(0);
            }
        )).toBe("Root-objectSingle-1");
    });
});

