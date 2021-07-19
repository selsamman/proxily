import {useContext, useState} from "react";
import {makeObservable} from "./proxyObserve";
import React from 'react';
import {Transaction} from "./Transaction";
import {useTransactable} from "./reactUse";

export const ObservableProvider = ({context, value, transaction, children} :
                                       {context : any, value : any , transaction?: Transaction, children: any}) => {

    transaction = transaction || useContext(TransactionContext);
    let [providerValue] = useState(() => makeObservable(typeof value === "function" ? value() : value));
    if (transaction)
        providerValue = useTransactable(providerValue, transaction)
    return (
        <context.Provider value={providerValue}>
            {children}
        </context.Provider>
    )
}


export const TransactionContext = React.createContext<Transaction>(undefined as unknown as Transaction);
export const TransactionProvider =   ({transaction, children} : {transaction? : Transaction, children: any}) => {
    const [providerValue] = useState( ()=> transaction || new Transaction());

    return (
        <TransactionContext.Provider value={providerValue}>
            {children}
        </TransactionContext.Provider>
    )
}
