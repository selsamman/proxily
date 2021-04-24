import * as React from 'react';
import { render, screen} from '@testing-library/react';
import {memoizeClass, memoizeObject, setLogLevel, useProxy, memoize, proxy} from '../../src';
import "@testing-library/jest-dom/extend-expect";

setLogLevel({});
describe('Counter Patterns',  () => {
    it( 'Can modify data directly in events', async () => {
        const state = {
            counter: {value: 0}
        };

        function App() {
            const  {counter} = useProxy(state);
            return (
                <div>
                    <span>Count: {counter.value}</span>
                    <button onClick={()=>counter.value++}>Increment</button>
                </div>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can modify data anywhere', async () => {
        const state = {
            counter: {value: 0}
        };

        setTimeout(()=> {
            proxy(state).counter.value++
        }, 1000);

        function App() {
            const  {counter} = useProxy(state);
            return (
                <div>
                    <span>Count: {counter.value}</span>
                </div>
            );
        }
        const {getByText, findByText} = render(<App />);
        await findByText("Count: 1", {}, {timeout: 1000});
        expect (getByText(/Count/)).toHaveTextContent("Count: 1");
    });

    it( 'Can have self contained state without TS' , async () => {
        const counter = {
            value : 0,
            increment () {this.value++}
        }
        const state = {
            counter: Object.create(counter)
        };

        // @ts-ignore
        function Counter({counter}) {
            const {value, increment} = useProxy(counter);
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        }
        function App () {
            return (
                <Counter counter={state.counter}/>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can have self contained state with TS' , async () => {
        class CounterState {
            private _value = 0;
            get value () {return this._value}
            increment () {this._value++}
        }
        const state = {
            counter: new CounterState()
        };

        function Counter({counter} : {counter : CounterState}) {
            const {value, increment} = useProxy(counter);
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        }
        function App () {
            return (
                <Counter counter={state.counter}/>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it("can memoize a function", async () => {
        let sorts = 0;

        const counter = {
            value : 0,
            increment () {
                this.value++
            }
        }
        const state = {
            counters: [Object.assign({},counter), Object.assign({},counter)],
            sortedCounters: function () {
                ++sorts;
                return this.counters.slice(0).sort((a,b) => a.value - b.value);
            }
        };
        // @ts-ignore
        function Counter({counter, id}) {
            const {value, increment} = useProxy(counter);
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }
        function App () {
            const {sortedCounters} = useProxy(state);
            return (
                <>
                    {sortedCounters().map((c, i) =>
                        <Counter key={i} id={'A' + i} counter={c} />
                    )}
                    {sortedCounters().map((c, i) =>
                        <Counter key={i} id={'B' + i} counter={c} />
                    )}
                </>
            );
        }
        memoizeObject(state, 'sortedCounters');
        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA0: 1")).toHaveTextContent("CountA0: 1");
        expect(sorts).toBe(2);

    });
    it("can memoize a class", async () => {
        let sorts = 0;

        class CounterClass {
            value = 0;
            increment () {
                this.value++
            }
        }
        class State {
            constructor () {
                this.counters = [new CounterClass(), new CounterClass()];
            }
            counters : Array<CounterClass> = [];
            sortedCounters () {
                sorts = sorts + 1;
                return this.counters.slice(0).sort((a,b) => a.value - b.value) as Array<CounterClass>;
            }
        };
        memoizeClass(State, 'sortedCounters');
        const state = new State();

        function Counter({counter, id} : {counter : CounterClass, id: any}) {
            const {value, increment} = useProxy(counter);
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }

        function App () {
            const {sortedCounters} = useProxy(state);
            return (
                <>
                    {sortedCounters().map((c, i) =>
                        <Counter  key={i} id={'A' + i} counter={c} />
                    )}
                    {sortedCounters().map((c, i) =>
                        <Counter  key={i} id={'B' + i} counter={c} />
                    )}
                </>
            );
        }

        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA0: 1")).toHaveTextContent("CountA0: 1");
        expect(sorts).toBe(2);
    });
    it("can memoize a class with a decorator", async () => {
        let sorts = 0;

        class CounterClass {
            value = 0;
            increment () {
                this.value++
            }
        }
        class State {
            constructor () {
                this.counters = [new CounterClass(), new CounterClass()];
            }
            counters : Array<CounterClass> = [];
            @memoize()
            sortedCounters () {
                sorts = sorts + 1;
                return this.counters.slice(0).sort((a,b) => a.value - b.value) as Array<CounterClass>;
            }
        };
        const state = new State();

        function Counter({counter, id} : {counter : CounterClass, id: any}) {
            const {value, increment} = useProxy(counter);
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }

        function App () {
            const {sortedCounters} = useProxy(state);
            return (
                <>
                    {sortedCounters().map((c, i) =>
                        <Counter  key={i} id={'A' + i} counter={c} />
                    )}
                    {sortedCounters().map((c, i) =>
                        <Counter  key={i} id={'B' + i} counter={c} />
                    )}
                </>
            );
        }

        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA0: 1")).toHaveTextContent("CountA0: 1");
        expect(sorts).toBe(2);
    });
});
