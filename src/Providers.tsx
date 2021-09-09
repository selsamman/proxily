import {useContext, useState, useMemo, useEffect} from "react";
import {observable} from "./proxyObserve";
import React from 'react';
import {Transaction, TransactionOptions} from "./Transaction";
import {addRoot, removeRoot} from "./devTools";
import {useTransaction} from "./reactUse";

export function ObservableProvider ({context, value, dependencies, transaction, children} :
             {context : any, value : Function | any , dependencies : Array<any>, transaction?: Transaction, children: any}) {

    transaction = transaction || useContext(TransactionContext);
    let [providerValue] = dependencies
        ? [useMemo(() =>
            observable(typeof value === "function" ? value() : value, transaction, true), dependencies)]
        : useState(() =>
            observable(typeof value === "function" ? value() : value, transaction, true))
    useEffect(() => {
        addRoot(providerValue.__target__);
        return () =>removeRoot(providerValue.__target__)
    }, []);
    return (
        <context.Provider value={providerValue}>
            {children}
        </context.Provider>
    )
}

export function TransactionProvider ({transaction, options, children} :
{transaction? : Transaction, options? : TransactionOptions, children: any}) {

    const providerValue = transaction || useTransaction(options || {});

    return (
        <TransactionContext.Provider value={providerValue}>
            {children}
        </TransactionContext.Provider>
    )
}

export const TransactionContext = React.createContext<Transaction>(undefined as unknown as Transaction);
