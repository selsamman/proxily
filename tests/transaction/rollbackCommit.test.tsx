import {proxy, Transaction} from "../../src";
import {Leaf, observeResult, Root} from "../data/classes";

describe("transation unit tests plane objects", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = proxy(root, transaction)
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
                const tRoot = proxy(root, transaction)
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
                const tRoot = proxy(root, transaction)
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
    /*
   it ("can rollback changes", () => {
       expect(observeResult(
           new Root(),
           (root) => {
               const transaction = new Transaction();
               const tRoot = proxy(root, transaction)
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
               const tRoot = proxy(root, transaction)
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
    */
});
describe("transation unit tests arrays", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = proxy(root, transaction)
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
                const tRoot = proxy(root, transaction)
                tRoot.arrayObjectCollection[0].str = "Foo";
                root.arrayObjectCollection[1].str = "Foo";
                expect(root.arrayObjectCollection[0].str).toBe("foo");
                expect(tRoot.arrayObjectCollection[1].str).toBe("Foo");
                transaction.commit();
                expect(root.arrayObjectCollection[0].str).toBe("Foo");
                expect(root.arrayObjectCollection[1].str).toBe("Foo");
                expect(tRoot.arrayObjectCollection[0].str).toBe("Foo");
                expect(tRoot.arrayObjectCollection[1].str).toBe("Foo");
            }
        )).toBe("Root-arrayObjectCollection-2");
    });
/*
    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = proxy(root, transaction)
                tRoot.arrayObjectCollection[0].str = "Foo";
                expect(tRoot.arrayObjectCollection[0].str).toBe("Foo");
                transaction.rollback();
                expect(tRoot.arrayObjectCollection[0].str).toBe("foo");
            }
        )).toBe("--0");
    });
 */
});

describe("transation unit tests maps", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = proxy(root, transaction)
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
                const tRoot = proxy(root, transaction)
                tRoot.mapCollection.set('1', new Leaf(99));
                expect(root.mapCollection.get('1')?.num).toBe(3);
                expect(tRoot.mapCollection.get('1')?.num).toBe(99);
                transaction.commit();
                expect(root.mapCollection.get('1')?.num).toBe(99);
                const leaf = root.mapCollection.get('1');
                if (leaf)
                    leaf.num = 88;
            }
        )).toBe("Root-mapCollection-2");
    });
/*
    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                const tRoot = proxy(root, transaction)
                tRoot.mapCollection.set('1', new Leaf(99));
                expect(root.mapCollection.get('1')?.num).toBe(3);
                expect(tRoot.mapCollection.get('1')?.num).toBe(99);
                transaction.rollback();
                expect(tRoot.mapCollection.get('1')?.num).toBe(3);
                expect(root.mapCollection.get('1')?.num).toBe(99);
            }
        )).toBe("--0");
    });
 */
});
describe("transation unit tests dates", () => {

    it ("can isolate changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                root.objectSingle.date.setMonth(0);
                const tRoot = proxy(root, transaction)
                tRoot.objectSingle.date.setMonth(1);
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
                root.objectSingle.date.setMonth(0);
                const tRoot = proxy(root, transaction)
                tRoot.objectSingle.date.setMonth(1);
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
                transaction.commit();
                expect(root.objectSingle.date.getMonth()).toBe(1);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
            }
        )).toBe("Root-objectSingle-2");
    });
/*
    it ("can rollback changes", () => {
        expect(observeResult(
            new Root(),
            (root) => {
                const transaction = new Transaction();
                root.objectSingle.date.setMonth(0);
                const tRoot = proxy(root, transaction)
                tRoot.objectSingle.date.setMonth(1);
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(1);
                transaction.rollback();
                expect(root.objectSingle.date.getMonth()).toBe(0);
                expect(tRoot.objectSingle.date.getMonth()).toBe(0);
            }
        )).toBe("--0");
    });
 */
});

