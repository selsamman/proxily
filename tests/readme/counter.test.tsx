import * as React from 'react';
import {render, screen} from '@testing-library/react';
import {setLogLevel, memoize, bindObservables, observer, observable, jestMockFromClass, useObservableProp, nonObservable, useLocalObservable} from '../../src';
import "@testing-library/jest-dom/extend-expect";

setLogLevel({});
describe('Counter Patterns',  () => {
    it( 'Redux Style example Counter',  () => {
        const store = observable({
            counter: {
                value: 0
            }
        });
        const actions = observable({
            increment () {
                store.counter.value++;
            }
        })
        const selectors = observable({
            get value () {
                return store.counter.value;
            }
        })
        const App = observer(function App() {
            const {value} = selectors;
            const {increment} = actions;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        })
        render(<App />);
        screen.getByText('Increment').click();
        expect (screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Redux Style example Todo',  () => {

        interface Item {text : string; completed: boolean};
        interface State {list : Array<Item>};

        const store = observable({
            list: []
        } as State);

        const actions = observable({
            add () {
                store.list.push({text: "New Item", completed: false})
            },
            toggle (todo : Item) {
                todo.completed = !todo.completed;
            }
        })

        const selectors = observable({
            get list () {
                return store.list;
            }
        })

        const App = observer(function App() {
            const {list} = selectors;
            const {add, toggle} = actions;
            return (
                <div>
                    <button onClick={add}>Add</button>
                    {list.map( (item, ix) =>
                        <div key={ix}>
                            <input type="checkbox" checked={item.completed} onChange={()=>toggle(item)} />
                            <span>{item.text}</span>
                        </div>
                    )}
                </div>
            );
        })
        render(<App />);
        screen.getByText('Add').click();
        expect (screen.getByText(/Item/)).toHaveTextContent("New Item");
        screen.getByRole("checkbox").click();
        expect (store.list[0].completed).toBe(true);

    });
    it( 'Minimal example', async () => {
        const counter = observable({value: 0});

        const App = observer(function App() {
            return (
                <div>
                    <span>Count: {counter.value}</span>
                    <button onClick={()=>counter.value++}>Increment</button>
                </div>
            );
        });
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can modify data directly in events', async () => {
        const state = observable({
            counter: {value: 0}
        });

        const App = observer(function App() {
            const  {counter} = state;
            return (
                <div>
                    <span>Count: {counter.value}</span>
                    <button onClick={()=>counter.value++}>Increment</button>
                </div>
            );
        });
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can modify data anywhere', async () => {
        const state = observable({
            counter: {value: 0}
        });

        setTimeout(()=> {
            const pstate = state;
            pstate.counter.value++
        }, 750);

        const App = observer(function App() {
            const  {counter} = state;
            return (
                <div>
                    <span>Count: {counter.value}</span>
                </div>
            );
        });
        const {getByText, findByText} = render(<App />);
        await findByText("Count: 1", {}, {timeout: 5000});
        expect (getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can modify data in async method', async () => {
        class CounterState {
            value = 0;
            async increment () {
                await new Promise(resolve => setTimeout(resolve, 1000));
                this.value++
            }
        }

        const Counter = observer(function Counter({counter} : {counter : CounterState}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        });

        const {getByText, findByText} = render(<Counter counter={observable(new CounterState())} />);
        expect (getByText(/Count/)).toHaveTextContent("Count: 0");
        screen.getByText('Increment').click();
        await findByText("Count: 1", {}, {timeout: 5000});
    });

    it( 'Can have self contained state without TS' , async () => {
        const counter = {
            value : 0,
            increment () {this.value++}
        }
        const state = observable({
            counter: Object.create(counter)
        });

        // @ts-ignore
        const Counter = observer(function Counter({counter}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        });

        const App = observer(function App () {
            // @ts-ignore
            return (<Counter counter={state.counter}/>);
        });
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can test component with jestMockFromClass' , async () => {
        class CounterState {
            constructor (val : number) {this._value = val}
            private _value : number = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }

        const Counter = observer(function Counter({counter} : {counter : CounterState}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        });
        const mockState = jestMockFromClass(CounterState, {get value () {return 5}});
        render(<Counter counter={mockState} />);
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 5");
        screen.getByText('Increment').click();
        expect(mockState.increment).toBeCalled();
    });
    it( 'Can have self contained state with TS' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        const state = observable({
            counter: new CounterState()
        });

        const Counter = observer(function Counter({counter} : {counter : CounterState}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        });
        const App = observer(function App () {
            return (
                <Counter counter={state.counter}/>
            );
        });
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can bind observables to class components' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        const state = observable({
            counter: new CounterState()
        });
        class CounterClass extends React.Component<{counter : CounterState}> {
            render () {
                const {value, increment} = this.props.counter;
                return (
                    <div>
                        <span>Count: {value}</span>
                        <button onClick={increment}>Increment</button>2
                    </div>
                );
            }
        }

        const Counter = bindObservables(CounterClass);
        function App () {
            return (
                <Counter counter={state.counter}/>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can use nonObservable' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        const state = observable({
            counter: new CounterState()
        });
        nonObservable(state, 'counter');

        const Counter = observer(function Counter({counter} : {counter : CounterState}) {
            const {value} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={() => counter.increment}>Increment</button>
                </div>
            );
        });
        function App () {
            return (
                <Counter counter={state.counter}/>
            );
        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 0");
    });
    it( 'Can use useObservable' , async () => {
        const counter = observable({
            value: 0
        });
        const App = observer(function App () {
            const [value, setValue] = useObservableProp(counter.value)
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={() => setValue(value + 1)}>Increment</button>
                </div>
            );

        });
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can use useLocalObservable' , async () => {

        const App = observer(function App () {
            const counter = useLocalObservable(() => ({
                value: 0
            }));
            const [value, setValue] = useObservableProp(counter.value)
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={() => setValue(value + 1)}>Increment</button>
                </div>
            );

        });
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it("can memoize a function", async () => {
        let sorts = 0;

        const counterState = {
            value : 0,
            increment () {
                this.value++
            }
        }
        const state = observable({
            counters: [Object.assign({},counterState), Object.assign({},counterState)],
            sortedCounters: function () {
                ++sorts;
                return this.counters.slice(0).sort((a,b) => a.value - b.value);
            }
        });
        const Counter = observer(function Counter({counter, id} : {counter: typeof counterState, id : string}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        });
        const App = observer(function App () {
            const {sortedCounters} = state;
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
        });
        memoize(state, 'sortedCounters');
        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
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
        }
        memoize(State, 'sortedCounters');
        const state = observable(new State());

        function Counter({counter, id} : {counter : CounterClass, id: any}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }

        const App = observer(function App () {
            const {sortedCounters} = state;
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
        });

        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
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
        }
        const state = observable(new State());

        const Counter = observer(function Counter({counter, id} : {counter : CounterClass, id: any}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        });

        const App = observer(function App () {
            const {sortedCounters} = state;
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
        });

        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
        expect(sorts).toBe(2);
    });
});
