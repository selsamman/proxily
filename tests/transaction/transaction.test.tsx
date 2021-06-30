import {Transaction} from "../../src";
import {proxy} from "../../src";
import {Target} from "../../src/proxyObserve";
import {Leaf} from "../data/classes";

describe("transation unit tests", () => {

    it ("can create transactions", () => {
        const txn1 = new Transaction({timePositioning: true});
        expect (txn1.timePositioning).toBe(true);
        const txn2 = Transaction.createDefaultTransaction({timePositioning: true})
        expect(Transaction.defaultTransaction).toBe(txn2);
        expect (txn2.timePositioning).toBe(true);
    });
    it ("can undo, redo and rollback", () => {
        const txn1 = new Transaction({timePositioning: true});
        let t1 = 10;
        let t2 = 10;
        const start = txn1.updateSequence;
        txn1.addPosition([() => t1 = t1 - 1, () => t1 = t1 + 1,() => t1 = t1 - 1, () => t1 = t1 + 1])
        txn1.addPosition([() => t2 = t2 - 1, () => t2 = t2 + 1, () => t2 = t2 - 1, () => t2 = t2 + 1]);
        const end = txn1.updateSequence;
        txn1.undo();
        expect(t1).toBe(10);
        expect(t2).toBe(8);
        txn1.undo();
        expect(t1).toBe(8);
        expect(t2).toBe(8);
        txn1.redo();
        expect(t1).toBe(10);
        expect(t2).toBe(8);
        txn1.redo();
        expect(t1).toBe(10);
        expect(t2).toBe(10);
        txn1.rollTo(start);
        expect(t1).toBe(8);
        expect(t2).toBe(8);
        txn1.rollTo(end);
        expect(t1).toBe(10);
        expect(t2).toBe(10);
    });
    it ("can undo, redo and rollback values", () => {
        const transaction = new Transaction({timePositioning: true});
        const target = {prop:  "initial"} ;
        const start = transaction.updateSequence;

        transaction.startTopLevelCall();
        transaction.recordTimePosition(target as unknown as Target, "prop", "initial", "one");
        transaction.recordTimePosition(target as unknown as Target, "prop", "one", "two");
        transaction.endTopLevelCall();
        transaction.startTopLevelCall();
        transaction.recordTimePosition(target as unknown as Target, "prop", "two", "three");
        transaction.recordTimePosition(target as unknown as Target, "prop", "three", "four");
        transaction.endTopLevelCall();

        const end = transaction.updateSequence;
        transaction.undo();
        expect(target.prop).toBe("two");
        transaction.undo();
        expect(target.prop).toBe("initial");
        transaction.redo();
        expect(target.prop).toBe("two");
        transaction.redo();
        expect(target.prop).toBe("four");
        transaction.rollTo(start);
        expect(target.prop).toBe("initial");
        transaction.rollTo(end);
        expect(target.prop).toBe("four");
    });

    it ("can undo, redo and rollback values using proxy", () => {
        const transaction = new Transaction({timePositioning: true});
        class Test {
            outerProp : string    = "initial";
            innerProp : string    = "initial";
            set (val1 : string, val2: string) {
                this.outerProp = "temp";
                this.innerSet(val2);
                this.outerProp = val1;
            }
            innerSet (val : string) {
                this.innerProp = val;
            }
        }
        const test = proxy(new Test(), transaction);

        const start = transaction.updateSequence;

        test.set("change1", "change1");
        test.set("change2", "change2");

        const end = transaction.updateSequence;
        transaction.undo();
        expect(test.outerProp).toBe("change1");
        expect(test.innerProp).toBe("change1");
        transaction.undo();
        expect(test.outerProp).toBe("initial");
        expect(test.innerProp).toBe("initial");
        transaction.redo();
        expect(test.outerProp).toBe("change1");
        expect(test.innerProp).toBe("change1");
        transaction.redo();
        expect(test.outerProp).toBe("change2");
        expect(test.innerProp).toBe("change2");
        transaction.rollTo(start);
        expect(test.outerProp).toBe("initial");
        expect(test.innerProp).toBe("initial");
        transaction.rollTo(end);
        expect(test.outerProp).toBe("change2");
        expect(test.innerProp).toBe("change2");
    });

    it ("can undo, redo and rollTo values using proxy", () => {
        const transaction = new Transaction({timePositioning: true});
        class Test {
            outerProp = {prop: "initial"};
            innerProp = {prop: "initial"};
            set (val1 : string, val2: string) {
                this.outerProp = {prop: "temp"};
                this.innerSet(val2);
                this.outerProp = {prop: val1};
            }
            innerSet (val : string) {
                this.innerProp = {prop: val};
            }
        }
        const test = proxy(new Test(), transaction);

        const start = transaction.updateSequence;

        test.set("change1", "change1");
        test.set("change2", "change2");

        const end = transaction.updateSequence;
        transaction.undo();
        expect(test.outerProp.prop).toBe("change1");
        expect(test.innerProp.prop).toBe("change1");
        transaction.undo();
        expect(test.outerProp.prop).toBe("initial");
        expect(test.innerProp.prop).toBe("initial");
        transaction.redo();
        expect(test.outerProp.prop).toBe("change1");
        expect(test.innerProp.prop).toBe("change1");
        transaction.redo();
        expect(test.outerProp.prop).toBe("change2");
        expect(test.innerProp.prop).toBe("change2");
        transaction.rollTo(start);
        expect(test.outerProp.prop).toBe("initial");
        expect(test.innerProp.prop).toBe("initial");
        transaction.rollTo(end);
        expect(test.outerProp.prop).toBe("change2");
        expect(test.innerProp.prop).toBe("change2");
    });

    it ("can undo, redo values using proxy array", () => {
        const transaction = new Transaction({timePositioning: true});
        class Test {
            arr = [new Leaf(1), new Leaf(2), new Leaf(3)];
          }
        const test = proxy(new Test(), transaction);

        test.arr.sort((a, b) => b.num - a.num);
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(3)
        expect(test.arr[1].num).toBe(2)
        expect(test.arr[2].num).toBe(1)
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(3);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(1);
        transaction.undo();

        test.arr.copyWithin(0,2,3);
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(3);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(3);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.undo();

        test.arr.splice(0, 1);
        expect(test.arr.length).toBe(2);
        expect(test.arr[0].num).toBe(2);
        expect(test.arr[1].num).toBe(3);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(2);
        expect(test.arr[0].num).toBe(2);
        expect(test.arr[1].num).toBe(3);
        transaction.undo();

        test.arr.fill(new Leaf(7), 1, 3);
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(7);
        expect(test.arr[2].num).toBe(7);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(7);
        expect(test.arr[2].num).toBe(7);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);

        test.arr.pop();
        expect(test.arr.length).toBe(2);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(2);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        transaction.undo();
    });

});
