import * as React from 'react';
import {act, render, screen} from '@testing-library/react';
import {
    observer,
    observable,
    useAsImmutable
} from '../../src';
import "@testing-library/jest-dom/extend-expect";
import {useEffect, useLayoutEffect} from "react";


describe('Use As Immutable',   () => {
    it( 'Fires effect with immutable data',  async () => {
        const news = observable({
            topics: ["politics", "tech", "cooking"],
            results: ""
        });
        const App = observer( function App () {
            const topics = news.topics;
            useEffect( () => {
                    news.results = news.topics.join(",");
                }, [topics]
            );
            return (<div>{news.results}</div>);
        });
        render(<App />);
        expect (!!await screen.findAllByText(/politics,tech,cooking/)).toBe(true);
        act(()=>{news.topics=["fun", "tech", "cooking"]});
        expect (!!await screen.findAllByText(/fun,tech,cooking/)).toBe(true);

    })
    it( 'Wont fire with mutable data',  async () => {
        const news = observable({
            topics: ["politics", "tech", "cooking"],
            results: ""
        });
        const App = observer( function App () {
            const topics = news.topics;
            useEffect( () => {
                    news.results = news.topics.join(",");
                }, [topics]
            );
            return (<div>{news.results}</div>);
        });
        render(<App />);
        expect (!!await screen.findAllByText(/politics,tech,cooking/)).toBe(true);
        act(()=>{news.topics[0] = "fun"});
        let found = false;
        try {
        if (await screen.findAllByText(/fun,tech,cooking/))
            found = true;
        } catch (e) {}
        expect(found).toBe(false);

    })
    it( 'Will fire with useAsImmutable',  async () => {
        const news = observable({
            topics: ["politics", "tech", "cooking"],
            results: ""
        });
        const App = observer( function App () {
            useLayoutEffect( () => {
                    news.results = news.topics.join(",");
                }, [useAsImmutable(news.topics)]
            );
            return (<div>{news.results}</div>);
        });
        render(<App />);
        expect (!!await screen.findAllByText(/politics,tech,cooking/)).toBe(true);
        act(()=>{news.topics[0] = "fun"});
        expect (!!await screen.findAllByText(/fun,tech,cooking/)).toBe(true);

    })
});
