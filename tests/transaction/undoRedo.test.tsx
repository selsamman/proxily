import {makeObservable, Transaction, useObservables, useTransactable} from "../../src";
import {Target} from "../../src/proxyObserve";
import {Leaf} from "../data/classes";
import {render, screen} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import * as React from "react";
import {useState} from "react";

describe("transation unit tests", () => {

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
        const target = makeObservable({prop:  "initial"}) ;
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
        const test = makeObservable(new Test(), transaction);

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
        const test = makeObservable(new Test(), transaction);
        expect(transaction.canUndo).toBe(false);
        expect(transaction.canRedo).toBe(false);
        const start = transaction.updateSequence;

        test.set("change1", "change1");
        test.set("change2", "change2");

        const end = transaction.updateSequence;
        expect(transaction.canUndo).toBe(true);
        expect(transaction.canRedo).toBe(false);
        transaction.undo();
        expect(transaction.canUndo).toBe(true);
        expect(transaction.canRedo).toBe(true);
        expect(test.outerProp.prop).toBe("change1");
        expect(test.innerProp.prop).toBe("change1");
        transaction.undo();
        expect(transaction.canUndo).toBe(false);
        expect(transaction.canRedo).toBe(true);
        expect(test.outerProp.prop).toBe("initial");
        expect(test.innerProp.prop).toBe("initial");
        transaction.redo();
        expect(transaction.canUndo).toBe(true);
        expect(transaction.canRedo).toBe(true);
        expect(test.outerProp.prop).toBe("change1");
        expect(test.innerProp.prop).toBe("change1");
        transaction.redo();
        expect(transaction.canUndo).toBe(true);
        expect(transaction.canRedo).toBe(false);
        expect(test.outerProp.prop).toBe("change2");
        expect(test.innerProp.prop).toBe("change2");
        transaction.rollTo(start);
        expect(transaction.canUndo).toBe(false);
        expect(transaction.canRedo).toBe(true);
        expect(test.outerProp.prop).toBe("initial");
        expect(test.innerProp.prop).toBe("initial");
        transaction.rollTo(end);
        expect(transaction.canUndo).toBe(true);
        expect(transaction.canRedo).toBe(false);
        expect(test.outerProp.prop).toBe("change2");
        expect(test.innerProp.prop).toBe("change2");
        transaction.clearUndoRedo();
        expect(transaction.canUndo).toBe(false);
        expect(transaction.canRedo).toBe(false);
    });

    it ("can undo, redo values using proxy array", () => {
        const transaction = new Transaction({timePositioning: true});
        class Test {
            arr = [new Leaf(1), new Leaf(2), new Leaf(3)];
          }
        const test = makeObservable(new Test(), transaction);

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

        test.arr.shift();
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

        test.arr.push(new Leaf(4), new Leaf(5));
        expect(test.arr.length).toBe(5);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        expect(test.arr[3].num).toBe(4);
        expect(test.arr[4].num).toBe(5);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(5);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        expect(test.arr[3].num).toBe(4);
        expect(test.arr[4].num).toBe(5);
        transaction.undo();

        test.arr.unshift(new Leaf(4), new Leaf(5));
        expect(test.arr.length).toBe(5);
        expect(test.arr[2].num).toBe(1);
        expect(test.arr[3].num).toBe(2);
        expect(test.arr[4].num).toBe(3);
        expect(test.arr[0].num).toBe(4);
        expect(test.arr[1].num).toBe(5);
        transaction.undo();
        expect(test.arr.length).toBe(3);
        expect(test.arr[0].num).toBe(1);
        expect(test.arr[1].num).toBe(2);
        expect(test.arr[2].num).toBe(3);
        transaction.redo();
        expect(test.arr.length).toBe(5);
        expect(test.arr[2].num).toBe(1);
        expect(test.arr[3].num).toBe(2);
        expect(test.arr[4].num).toBe(3);
        expect(test.arr[0].num).toBe(4);
        expect(test.arr[1].num).toBe(5);
        transaction.undo();

    });
    it ("can undo, redo values using proxy date", () => {
        const transaction = new Transaction({timePositioning: true});
        class Test {
            date = new Date("2020/01/01");
        }
        const test = makeObservable(new Test(), transaction);

        expect(test.date.getMonth()).toBe(0);
        test.date.setMonth(-1);
        expect(test.date.getMonth()).toBe(11);
        transaction.undo();
        expect(test.date.getMonth()).toBe(0);
        transaction.redo();
        expect(test.date.getMonth()).toBe(11);
        transaction.undo();

    });
    it ("can undo, redo values using proxy map", () => {
        const transaction = new Transaction({timePositioning: true});
        class Test {
            map = new Map([[1, new Leaf(1)], [2, new Leaf(2)]]);
        }
        const test = makeObservable(new Test(), transaction);
        expect(test.map.get(1)?.num).toBe(1);
        expect(test.map.get(2)?.num).toBe(2);

        test.map.set(2, new Leaf(-2));
        expect(test.map.size).toBe(2);
        expect(test.map.get(1)?.num).toBe(1);
        expect(test.map.get(2)?.num).toBe(-2);
        transaction.undo();
        expect(test.map.size).toBe(2);
        expect(test.map.get(1)?.num).toBe(1);
        expect(test.map.get(2)?.num).toBe(2);
        transaction.redo();
        expect(test.map.size).toBe(2);
        expect(test.map.get(1)?.num).toBe(1);
        expect(test.map.get(2)?.num).toBe(-2);
        transaction.undo();

        test.map.delete(1);
        expect(test.map.size).toBe(1);
        expect(test.map.get(1)?.num).toBe(undefined);
        expect(test.map.get(2)?.num).toBe(2);
        transaction.undo();
        expect(test.map.size).toBe(2);
        expect(test.map.get(1)?.num).toBe(1);
        expect(test.map.get(2)?.num).toBe(2);
        transaction.redo();
        expect(test.map.size).toBe(1);
        expect(test.map.get(1)?.num).toBe(undefined);
        expect(test.map.get(2)?.num).toBe(2);
        transaction.undo();
    });

    it ("can undo, redo values using proxy set", () => {
        const transaction = new Transaction({timePositioning: true});
        const leaf1 = new Leaf(1);
        const leaf2 = new Leaf(2);
        const leaf3 = new Leaf(3)
        class Test {
            set = new Set([leaf1, leaf2]);
        }
        const test = makeObservable(new Test(), transaction);
        expect(test.set.has(leaf1)).toBe(true);
        expect(test.set.has(leaf2)).toBe(true);

        test.set.add(leaf3);
        expect(test.set.size).toBe(3);
        expect(test.set.has(leaf1)).toBe(true);
        expect(test.set.has(leaf2)).toBe(true);
        expect(test.set.has(leaf3)).toBe(true);
        transaction.undo();
        expect(test.set.size).toBe(2);
        expect(test.set.has(leaf1)).toBe(true);
        expect(test.set.has(leaf2)).toBe(true);
        expect(test.set.has(leaf3)).toBe(false);
        transaction.redo();
        expect(test.set.size).toBe(3);
        expect(test.set.has(leaf1)).toBe(true);
        expect(test.set.has(leaf2)).toBe(true);
        expect(test.set.has(leaf3)).toBe(true);
        transaction.undo();

    });

});
describe("Transaction Component Test", () => {

    const state = makeObservable({
        counter: {value: 0}
    });
    function Counter({txn} : {txn : Transaction}) {
        useObservables();
        const  {counter} = useTransactable(state, txn);
        return (
            <div>
                <span>Count: {counter.value}</span>
                <button onClick={()=>counter.value++}>Increment</button>
            </div>
        );
    }

    it ("Can force render on changes if canundo caled", () => {
        function App () {
            useObservables();
            const [txn] = useState(() => new Transaction({timePositioning: true}));
            return (
                <div>
                    <span data-testid={1}>{txn.canUndo ? "Can Undo" : "Cannot Undo"}</span>
                    <Counter txn={txn} />
                </div>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (screen.getByTestId(1)).toHaveTextContent("Can Undo");

    });
});
