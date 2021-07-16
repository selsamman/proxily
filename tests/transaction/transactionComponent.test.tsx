import {
    makeObservable,
    useTransactable,
    Transaction,
    useObservables,
    TransactionContext,
    TransactionProvider
} from "../../src";
import {useContext, useState} from "react";
import * as React from 'react';
import "@testing-library/jest-dom/extend-expect";
import { render, screen} from '@testing-library/react';
import userEvent from "@testing-library/user-event";

class Customer {
    name = "Sam";
    phone = "123";
    setName (name : string) {this.name = name;}
    setPhone (phone : string) { this.phone = phone; }
}
function UpdateCustomer ({customer} : {customer : Customer}) {
    useObservables();
    const [updateAddressTxn] = useState(() => new Transaction());
    customer = useTransactable(customer, updateAddressTxn);
    const {name, phone, setName, setPhone} = customer;
    return (
        <>
            <input data-testid="n" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <input data-testid="p" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button onClick={() => updateAddressTxn.commit()} >Commit</button>
            <button onClick={() => updateAddressTxn.rollback()} >Rollback</button>
        </>
    )
}
function UpdateCustomerWithContext ({customer} : {customer : Customer}) {
    useObservables();
    const updateAddressTxn = useContext(TransactionContext);
    customer = useTransactable(customer, updateAddressTxn);
    const {name, phone, setName, setPhone} = customer;
    return (
        <>
            <input data-testid="n" type="text" value={name} onChange={(e) => setName(e.target.value)} />
            <input data-testid="p" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button onClick={() => updateAddressTxn.commit()} >Commit</button>
            <button onClick={() => updateAddressTxn.rollback()} >Rollback</button>
        </>
    )
}

describe("Transaction Component Tests", () => {
    it ("can commit", async () => {
        function App () {
            return (<UpdateCustomer customer={customer} />)
        }
        const customer = makeObservable(new Customer());
        render(<App />);
        const input = screen.getByTestId('n') as HTMLInputElement;
        input.select();
        userEvent.type(input, 'Karen');
        expect(input).toHaveValue('Karen');
        expect (customer.name).toBe("Sam")
        screen.getByText('Commit').click();
        expect (customer.name).toBe("Karen")
    })
    it ("can rollback", async () => {
        function App () {
            return (<UpdateCustomer customer={customer} />)
        }
        const customer = makeObservable(new Customer());
        render(<App />);
        const input = screen.getByTestId('n') as HTMLInputElement;
        input.select();
        userEvent.type(input, 'Karen');
        expect(input).toHaveValue('Karen');
        expect (customer.name).toBe("Sam")
        screen.getByText('Rollback').click();
        expect (customer.name).toBe("Sam")
    })
    it ("can commit with context", async () => {
        function App () {
            return (
                <TransactionProvider>
                    <UpdateCustomerWithContext customer={customer} />
                </TransactionProvider>
            )
        }
        const customer = makeObservable(new Customer());
        render(<App />);
        const input = screen.getByTestId('n') as HTMLInputElement;
        input.select();
        userEvent.type(input, 'Karen');
        expect(input).toHaveValue('Karen');
        expect (customer.name).toBe("Sam")
        screen.getByText('Commit').click();
        expect (customer.name).toBe("Karen")
    })
})