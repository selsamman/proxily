import * as React from 'react';
import {act, render, screen} from '@testing-library/react';
import "@testing-library/jest-dom/extend-expect";
import {useState} from "react";
import {observer, useObservableTransition} from "../src/reactUse";
import {observable, setLogLevel} from "../src";
import {resetLogging, setLog} from "../src/log";

jest.mock('react', () => ({
    ...jest.requireActual("react"),
    useState: jest.fn(),
    useTransition: jest.fn(),
    useDeferredValue: jest.fn(),
}));
const wait = (time : number) => new Promise((res : any) =>setTimeout(()=>res(), time));
let tasks : Array<Function> = [];
let timer : any;
let inTransition = false;
let logs : Array<string> = [];
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
function mockUseDeferredValue (value : any) {
    return inTransition ? -1 : value;
}
describe ("test mock", () => {

    beforeEach(() => {
        // @ts-ignore
        React.useState.mockImplementation(value => {
            const r = jest.requireActual('react').useState(value);
            return [r[0] + "mocked", r[1]];
        });
    });
    afterEach( () => {
        // @ts-ignore
        React.useState.mockClear();
    });


    it ("can mock useState", () => {
        const App = () => {
            const [foo] = useState("init");
            return (
                <div data-testid="x">
                    {foo}
                </div>
            );
        }
        render(<App/>);
        expect (screen.getByTestId( 'x')).toHaveTextContent("initmocked");
    });
})

describe ("basic transition", () => {

    beforeEach(() => {
        // @ts-ignore
        React.useState.mockImplementation(mockUseState);
        // @ts-ignore
        React.useTransition.mockImplementation(mockUseTransition);
        // @ts-ignore
        React.useDeferredValue.mockImplementation(mockUseDeferredValue);
        setLogLevel({transitions: true});
        logs = [];
        setLog((str) => logs.push(str));
    });
    afterEach( () => {
        // @ts-ignore
        React.useState.mockClear();
        // @ts-ignore
        React.useTransition.mockClear();
        // @ts-ignore
        React.useDeferredValue.mockClear();
        resetLogging();
        expect(logs[logs.length - 1]).toBe('Deleted all snapshots');
    });

    const counter = observable({
        count: 1,
        increment () {this.count++}
    })

    it ("can mock useState", async () => {
        const App = observer(() => {
            // @ts-ignore
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
        expect (screen.getByTestId( 'pending')).toHaveTextContent("true");
        expect (screen.getByTestId( 'count')).toHaveTextContent("1");
        await wait(1000);
        await expect (screen.getByTestId( 'pending')).toHaveTextContent("false");
        expect (screen.getByTestId( 'count')).toHaveTextContent("2");

    });
})
