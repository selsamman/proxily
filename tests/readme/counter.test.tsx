import * as React from 'react';
import {render, screen} from '@testing-library/react';
import {setLogLevel, memoize, useObservables, makeObservable, jestMockFromClass, useObservableProp, nonObservable, useLocalObservable} from '../../src';
import "@testing-library/jest-dom/extend-expect";
import {bindObservables} from "../../src/reactUse";

setLogLevel({});
describe('Counter Patterns',  () => {
    it( 'Redux Style example Counter',  () => {
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
    });
    it( 'Redux Style example Todo',  () => {

        interface Item {text : string; completed: boolean};
        interface State {list : Array<Item>};

        const store = makeObservable({
            list: []
        } as State);

        const actions = makeObservable({
            add () {
                store.list.push({text: "New Item", completed: false})
            },
            toggle (todo : Item) {
                todo.completed = !todo.completed;
            }
        })

        const selectors = makeObservable({
            get list () {
                return store.list;
            }
        })

        function App() {
            useObservables();
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
        }
        render(<App />);
        screen.getByText('Add').click();
        expect (screen.getByText(/Item/)).toHaveTextContent("New Item");
        screen.getByRole("checkbox").click();
        expect (store.list[0].completed).toBe(true);

    });
    it( 'Minimal example', async () => {
        const counter = makeObservable({value: 0});

        function App() {
            useObservables();
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
    it( 'Can modify data directly in events', async () => {
        const state = makeObservable({
            counter: {value: 0}
        });

        function App() {
            useObservables();
            const  {counter} = state;
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
        const state = makeObservable({
            counter: {value: 0}
        });

        setTimeout(()=> {
            const pstate = state;
            pstate.counter.value++
        }, 750);

        function App() {
            useObservables();
            const  {counter} = state;
            return (
                <div>
                    <span>Count: {counter.value}</span>
                </div>
            );
        }
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

        function Counter({counter} : {counter : CounterState}) {
            useObservables();
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        }

        const {getByText, findByText} = render(<Counter counter={makeObservable(new CounterState())} />);
        expect (getByText(/Count/)).toHaveTextContent("Count: 0");
        screen.getByText('Increment').click();
        await findByText("Count: 1", {}, {timeout: 5000});
    });

    it( 'Can have self contained state without TS' , async () => {
        const counter = {
            value : 0,
            increment () {this.value++}
        }
        const state = makeObservable({
            counter: Object.create(counter)
        });

        // @ts-ignore
        function Counter({counter}) {
            useObservables();
            const {value, increment} = counter;
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
    it( 'Can test component with jestMockFromClass' , async () => {
        class CounterState {
            constructor (val : number) {this._value = val}
            private _value : number = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }

        function Counter({counter} : {counter : CounterState}) {
            useObservables();
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={increment}>Increment</button>
                </div>
            );
        }
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
        const state = makeObservable({
            counter: new CounterState()
        });

        function Counter({counter} : {counter : CounterState}) {
            useObservables();
            const {value, increment} = counter;
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
    it( 'Can bind observables to class components' , async () => {
        class CounterState {
            private _value = 0;
            get value () {
                return this._value
            }
            increment () {this._value++}
        }
        const state = makeObservable({
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
        const state = makeObservable({
            counter: new CounterState()
        });
        nonObservable(state, 'counter');

        function Counter({counter} : {counter : CounterState}) {
            useObservables();
            const {value} = counter;
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={() => counter.increment}>Increment</button>
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
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 0");
    });
    it( 'Can use useObservable' , async () => {
        const counter = makeObservable({
            value: 0
        });
        function App () {
            useObservables();
            const [value, setValue] = useObservableProp(counter.value)
            return (
                <div>
                    <span>Count: {value}</span>
                    <button onClick={() => setValue(value + 1)}>Increment</button>
                </div>
            );

        }
        render(<App />);
        screen.getByText('Increment').click();
        expect (await screen.getByText(/Count/)).toHaveTextContent("Count: 1");
    });
    it( 'Can use useLocalObservable' , async () => {

        function App () {
            useObservables();
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
        const state = makeObservable({
            counters: [Object.assign({},counter), Object.assign({},counter)],
            sortedCounters: function () {
                ++sorts;
                return this.counters.slice(0).sort((a,b) => a.value - b.value);
            }
        });
        // @ts-ignore
        function Counter({counter, id}) {
            useObservables();
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }
        function App () {
            useObservables();
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
        }
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
        const state = makeObservable(new State());

        function Counter({counter, id} : {counter : CounterClass, id: any}) {
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }

        function App () {
            useObservables();
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
        }

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
        const state = makeObservable(new State());

        function Counter({counter, id} : {counter : CounterClass, id: any}) {
            useObservables();
            const {value, increment} = counter;
            return (
                <div>
                    <span>Count{id}: {value}</span>
                    <button onClick={increment}>Increment{id}</button>
                </div>
            );
        }

        function App () {
            useObservables();
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
        }

        render(<App />);
        screen.getByText('IncrementA0').click();
        expect (await screen.getByText("CountA1: 1")).toHaveTextContent("CountA1: 1");
        expect(sorts).toBe(2);
    });
});
