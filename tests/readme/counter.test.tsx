import * as React from 'react';
import {act, render, screen} from '@testing-library/react';
import {
    setLogLevel,
    memoize,
    observer,
    observable,
    jestMockFromClass,
    useObservableProp,
    nonObservable,
    useLocalObservable,
    ObservableProvider
} from '../../src';
import "@testing-library/jest-dom/extend-expect";
import {useContext} from "react";
import {releaseObservable} from "../../src/proxyObserve";
setLogLevel({});
describe('Counter Patterns',   () => {
    it( 'Redux Style example Counter',  async () => {
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
        }, {memo: false})
        render(<React.StrictMode><App /></React.StrictMode>);
        await act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Redux Style example Todo',  async () => {

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
        act(()=>screen.getByText('Add').click());
        expect (await screen.findByText(/Item/)).toHaveTextContent("New Item");
        act(()=>screen.getByRole("checkbox").click());
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Minimal class example', async () => {
        class Counter {
            count = 0;
            increment () {
                this.count++;
            }
        }
        const state = observable(new Counter());

        function App() {
            const {count, increment} = state;
            return (
                <div>
                    <span>Count: {count}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        };
        const DefaultApp = observer(App);
        render(<DefaultApp />);
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
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
        act(()=>screen.getByText('Increment').click());
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
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
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 5");
        act(()=>screen.getByText('Increment').click());
        expect(mockState.increment).toBeCalled();
    });
    it( 'Can test component with jestMockFromClass simplified' , async () => {
        class CounterState {
            value = 0;
            increment () {this.value++}
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
        const counter = new CounterState();
        counter.increment();
        expect(counter.value).toBe(1);

        const mockState = jestMockFromClass(CounterState, {value: 5});
        render(<Counter counter={mockState} />);
        expect (screen.getByText(/Count/)).toHaveTextContent("Count: 5");
        act(()=>screen.getByText('Increment').click());
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
        releaseObservable(state);
    });

    it( 'Can use ObservableProvider' , async () => {
        class CounterState {
            value = 0;
            increment () {this.value++}
        }
        const CounterContext = React.createContext(undefined as unknown as CounterState);

        const Counter = observer(function Counter() {
            const counter = useContext(CounterContext);
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
                <ObservableProvider context={CounterContext} value={() => new CounterState()} dependencies={[]}>
                    <Counter />
                </ObservableProvider>
            );
        });
        render(<App />);
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
    });

/*
    it( 'Can bind observables to class components' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        setLogLevel({transitions: true, render: true, propertyTracking: true, propertyChange: true});
        const state = observable({
            counter: new CounterState()
        });
        class CounterClass extends React.Component<{counter : CounterState, text: string}> {
            render () {
                const {value, increment} = this.props.counter;
                const text = this.props.text;
                return (
                    <div>
                        <span>{text}: {value}</span>
                        <button onClick={increment}>Increment</button>2
                    </div>
                );
            }
        }

        const Counter = bindObservables(CounterClass);
        const App = observer(function App () {
            return (
                <Counter counter={state.counter} text="Count"/>
            );
        })
        render(<App />);
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
    });

 */
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 0");
    });
    it( 'Can use nonObservable decorator' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        class State {
            @nonObservable()
            counter: CounterState;
            constructor () {
                this.counter = new CounterState();
            }
        }
        const state = observable(new State());

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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 0");
    });

    it( 'Can use nonObservable class' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        class State {
            counter: CounterState;
            constructor () {
                this.counter = new CounterState();
            }
        }
        nonObservable(State, 'counter');
        const state = observable(new State());

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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 0");
    });

    it( 'Can detect object replacement' , async () => {
        class CounterState {
            value = 0;
            constructor(v : number) {
                this.value = v;
            }
        }
        class State {
            counter: CounterState;
            constructor () {
                this.counter = new CounterState(0);
            }
        }

        const state = observable(new State());

        const Counter = observer(function Counter({state} : {state : State}) {
            return (
                <div>
                    <span>Count: {state.counter.value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
            function increment() {
                state.counter = new CounterState(state.counter.value + 1);
            }
        });
        function App () {
            return (
                <Counter state={state}/>
            );
        }
        render(<App />);
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
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
        act(()=>screen.getByText('Increment').click());
        expect (await screen.findByText(/Count/)).toHaveTextContent("Count: 1");
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
        act(()=>screen.getByText('IncrementA0').click());
        expect (await screen.findByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
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
        act(()=>screen.getByText('IncrementA0').click());
        expect (await screen.findByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
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
        act(()=>screen.getByText('IncrementA0').click());
        expect (await screen.findByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
        expect(sorts).toBe(2);
    });
    it("can track ref in two classes", async () => {

        class CounterClass {
            value = 0;
            increment () {
                this.value++
            }
            @memoize()
            get val() {
                return this.value;
            }
        }
        const state = observable(new CounterClass());

        const App1 = observer(function App1 () {
            const {val, increment} = state;
            return (
                <>
                    <span>A1Count: {val}</span>
                    <button onClick={increment}>A1Increment</button>
                </>
            );
        });
        const App2 = observer(function App1 () {
            const {val, increment} = state;
            return (
                <>
                    <span>A2Count: {val}</span>
                    <button onClick={increment}>A2Increment</button>
                </>
            );
        });

        render(<App1 />);
        render(<App2 />);
        act(()=>screen.getByText('A1Increment').click());
        expect (await screen.findByText("A1Count: 1")).toHaveTextContent("A1Count: 1");
        expect (await screen.findByText("A2Count: 1")).toHaveTextContent("A2Count: 1");
    });
});
