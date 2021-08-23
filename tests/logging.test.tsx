import * as React from 'react';
import {render, screen} from '@testing-library/react';
import {setLogLevel, useObservables, makeObservable} from '../src';
import "@testing-library/jest-dom/extend-expect";
import {resetLogging, setLog} from "../src/log";
import {Leaf, observeResult, Root} from "./data/classes";

setLogLevel({});
describe('Logging Tests',  () => {

    let logs : Array<string> = [];
    beforeEach(() => {
        logs = [];
        setLog((str) => logs.push(str));
    })
    afterEach(() => resetLogging());

    it( 'Can get component name',  () => {
        const store = makeObservable({
            counter: {
                value: 0
            }
        });
        const actions = makeObservable({
            increment () {
                store.counter.value++;
            }
        })
        const selectors = makeObservable({
            get value () {
                return store.counter.value;
            }
        })
        setLogLevel({render: true, propertyChange: true});
        function App() {
            useObservables();
            const {value} = selectors;
            const {increment} = actions;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (screen.getByText(/Count/)).toHaveTextContent("Count: 1");
        expect(logs.length).toBe(3);
        expect(logs[0]).toBe("App render (1)");
        expect(logs[1]).toBe("Object.increment: Object.value = 1");
        expect(logs[2]).toBe("App render (2)");
    });
    it ("can observe changes to scalars", () => {

        observeResult(new Root(), (root) => {
            setLogLevel({render: true, propertyChange: true});
            const leaf = root.objectCollection.a;
            leaf.num = 33;
            leaf.str = "foo";
            expect(logs.length).toBe(2);
            expect(logs[0]).toBe("Leaf.num = 33");
            expect(logs[1]).toBe("Leaf.str = foo");
        });

    });
    it ("can observe changes to arrays", () => {

        observeResult(new Root(), (root) => {
            setLogLevel({render: true, propertyChange: true});
            root.arrayObjectCollection[0] = new Leaf();
            delete root.arrayObjectCollection[0];
            root.arrayCollection[44] = 77;
            root.arrayCollection.push(88);
            root.arrayCollection.splice(0);
            delete root.arrayCollection[88];
            expect(logs.length).toBe(6);
            expect(logs[0]).toBe("Root.arrayObjectCollection[0] modified");
            expect(logs[1]).toBe("Root.arrayObjectCollection[0] modified");
            expect(logs[2]).toBe("Root.arrayCollection[44] = 77");
            expect(logs[3]).toBe("Root.arrayCollection modified");
            expect(logs[4]).toBe("Root.arrayCollection modified");
            expect(logs[5]).toBe("Root.arrayCollection[88] modified");
        });

    });
    it ("can observe changes to maps", () => {

        observeResult(new Root(), (root) => {
            setLogLevel({render: true, propertyChange: true});
            root.mapCollection.set('foo', new Leaf());
            root.mapCollection.delete('foo');
            root.mapCollection.clear();
            expect(logs.length).toBe(3);
            expect(logs[0]).toBe("Root.mapCollection[foo] modified");
            expect(logs[1]).toBe("Root.mapCollection[foo] modified");
            expect(logs[2]).toBe("Root.mapCollection modified");
        });
    });

    it ("can observe changes to sets", () => {

        observeResult(new Root(), (root) => {
            setLogLevel({render: true, propertyChange: true});
            const l = new Leaf();
            root.setCollection.add(l);
            root.setCollection.delete(l);
            root.setCollection.clear();
            expect(logs.length).toBe(3);
            expect(logs[0]).toBe("Root.setCollection[object] modified");
            expect(logs[1]).toBe("Root.setCollection[object] modified");
            expect(logs[2]).toBe("Root.setCollection modified");
        });
    });
    it ("can observe changes to dates", () => {

        observeResult(new Root(), (root) => {
            setLogLevel({render: true, propertyChange: true});
            root.objectSingle.date.setMonth(33);
            expect(logs.length).toBe(1);
            expect(logs[0]).toBe("Leaf.date modified");
        });
    });
    it ("can log references", () => {

        class Item {
            text = "";
            completed = false
        };

        class State {
            private _list : Array<Item> = [new Item()];
            get list () {return this._list}
        };

        const store = makeObservable(new State());

        setLogLevel({propertyTracking: true})

        function App() {
            useObservables();
            return (
                <div>
                    {store.list.map( (item, ix) =>
                        <div key={ix}>
                            {item.completed && <span>completed: </span>}
                            <span>{item.text}{item.text}</span>
                        </div>
                    )}
                </div>
            );
        }

        render(<App />);

        expect(logs.length).toBe(1);
        expect(logs[0]).toBe("App Observer tracking State._list, Item.completed, Item.text");
    });

});
