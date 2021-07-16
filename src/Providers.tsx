import {useState} from "react";
import {proxy} from "./proxyObserve";
import React from 'react';
import {Transaction} from "./Transaction";

export const ObservableProvider = ({provider, value, children} : {provider : any, value : any , children: any}) => {

    const [providerValue] = useState(() => proxy(typeof value === "function" ? value() : value));

    return (
        <provider.Provider value={providerValue}>
            {children}
        </provider.Provider>
    )
}

export const TransactionContext = React.createContext<Transaction>(undefined as unknown as Transaction);
export const TransactionProvider =   ({children} : {children: any}) => {
    const [providerValue] = useState( ()=> new Transaction());

    return (
        <TransactionContext.Provider value={providerValue}>
            {children}
        </TransactionContext.Provider>
    )
}
