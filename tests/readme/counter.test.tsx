import * as React from 'react';
import {render, screen} from '@testing-library/react';
import {useProxy} from '../../src';

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
    it( 'Can have self contained state without TS' , async () => {
        const counter = {
            value : 0,
            increment () {this.value++}
        }
        const state = {
            counter: counter
        };

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
            value = 0;
            increment () {this.value++}
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
});
