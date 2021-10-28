import * as React from 'react';
import {act, render, screen} from '@testing-library/react';
import "@testing-library/jest-dom/extend-expect";
import {observer, useDeferredObservable, useObservableStartTransition, useObservableTransition} from "../src/reactUse";
import {observable, setLogLevel} from "../src";
import {resetLogging, setLog} from "../src/log";

jest.mock('react', () => ({
    ...jest.requireActual("react"),
    useState: jest.fn(),
    useTransition: jest.fn(),
    startTransition: jest.fn(),
    useDeferredValue: jest.fn(),
}));
const wait = (time : number) => new Promise((res : any) =>setTimeout(()=>res(), time));
let tasks : Array<Function> = [];
let timer : any;
let inTransition = false;
let logs : Array<string> = [];
let counter : any;
let rerender : any;
let AppToRender : any;
function mockUseState (value : any) {
    const useStateReturn = jest.requireActual('react').useState(value);
    return [useStateReturn[0], setStateWrapper]
    function setStateWrapper (value : any) {
        if (inTransition) {
            tasks.push(() => {
                useStateReturn[1](value)
            })
            if (!timer) {
                timer = setTimeout(() => {
                    const todo = tasks.slice(0);
                    clearTimeout(timer);
                    timer = undefined;
                    tasks = [];
                    todo.forEach( task => act(() => task()));
                }, 250);
            }
        } else
            useStateReturn[1](value)
    };
}

function mockUseTransition () {
    const [, setSeq] = jest.requireActual('react').useState(1);
    return [!!tasks.length, (cb : Function) => {
        inTransition = true;
        cb();
        inTransition = false;
        setSeq((s : number) => {
            return s + 1
        })
    }]
}
function mockStartTransition (cb : Function) {
    inTransition = true;
    cb();
    inTransition = false;
    rerender(<AppToRender />);
}
function mockUseDeferredValue (value : any) {
    return inTransition ? -1 : value;
}
describe ("basic transition", () => {

    beforeEach(() => {
        // @ts-ignore
        React.useState.mockImplementation(mockUseState);
        // @ts-ignore
        React.useTransition.mockImplementation(mockUseTransition);
        // @ts-ignore
        React.startTransition.mockImplementation(mockStartTransition);
        // @ts-ignore
        React.useDeferredValue.mockImplementation(mockUseDeferredValue);
        setLogLevel({transitions: true});
        logs = [];
        setLog((str) => logs.push(str));

        counter = observable({
            count: 1,
            increment () {this.count++}
        })
    });
    afterEach( () => {
        // @ts-ignore
        React.useState.mockClear();
        // @ts-ignore
        React.useTransition.mockClear();
        // @ts-ignore
        React.startTransition.mockClear();
        // @ts-ignore
        React.useDeferredValue.mockClear();
        resetLogging();
        expect(logs[logs.length - 1]).toBe('Deleted all snapshots');
    });


    it ("supports useObservableTransition", async () => {
        const App = observer(() => {
            const [isPending, startTransition] = useObservableTransition();
            const transition = () => {
                startTransition(() => counter.increment());
            };
            return (
                <>
                    <div data-testid="pending">
                        {isPending ? "true" : "false"}
                    </div>
                    <div data-testid="count">
                        {counter.count}
                    </div>
                    <button onClick={transition}>
                        Transition
                    </button>
                </>
            );
        });
        render(<App/>);
        expect (screen.getByTestId( 'pending')).toHaveTextContent("false");
        screen.getByText('Transition').click();
        expect (await screen.findByTestId( 'pending')).toHaveTextContent("true");
        expect (screen.getByTestId( 'count')).toHaveTextContent("1");
        await wait(1000);
        await expect (screen.getByTestId( 'pending')).toHaveTextContent("false");
        expect (screen.getByTestId( 'count')).toHaveTextContent("2");

    });
    it ("supports startObservableTranstion", async () => {
        const App = observer(() => {

            const startTransition = useObservableStartTransition();
            const transition = () => {
                startTransition(() => counter.increment());
            };
            return (
                <>
                    <div data-testid="count">
                        {counter.count}
                    </div>
                    <button onClick={transition}>
                        Transition
                    </button>
                </>
            );
        });
        AppToRender = App;
        rerender = render(<AppToRender />).rerender;
        expect (screen.getByTestId( 'count')).toHaveTextContent("1");
        screen.getByText('Transition').click();
        expect (screen.getByTestId( 'count')).toHaveTextContent("1");
        await wait(1000);
        expect (screen.getByTestId( 'count')).toHaveTextContent("2");

    });
    it ("supports useDeferredValue", async () => {
        const App = observer(() => {

            const [{count}, startTransition] = useDeferredObservable(counter);
            const transition = () => {
                startTransition(() => counter.increment());
            };
            return (
                <>
                    <div data-testid="count">
                        {count}
                    </div>
                    <button onClick={transition}>
                        Transition
                    </button>
                </>
            );
        });
        AppToRender = App;
        rerender = render(<AppToRender />).rerender;
        expect (screen.getByTestId( 'count')).toHaveTextContent("1");
        screen.getByText('Transition').click();
        expect (screen.getByTestId( 'count')).toHaveTextContent("1");
        await wait(1000);
        expect (screen.getByTestId( 'count')).toHaveTextContent("2");

    });
})
