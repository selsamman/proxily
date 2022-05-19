import * as React from 'react';
import {act, render, screen} from '@testing-library/react';
import {observer, observable} from '../../src';
import "@testing-library/jest-dom/extend-expect";


describe('Todos Examples',   () => {

    it( 'Nested Stores',  async () => {

        class ApplicationStore {
            todoStore: TodoStore
            constructor() {
                this.todoStore = new TodoStore(this)
            }
        }

        class TodoStore {
            todos: Map<string, Todo>
            applicationStore: ApplicationStore
            constructor(applicationStore: ApplicationStore) {
                this.applicationStore = applicationStore
                this.todos = new Map()
                this.todos.set("one", new Todo("Sample", this))
            }
        }

        class Todo {
            store: TodoStore;
            body: string;
            constructor(body: string, store: TodoStore) {
                this.store = store;
                this.body = body;
            }
        }

        const store = observable(new ApplicationStore())

        function App() {
            const todo = store.todoStore.todos.get("one");
            const edit = () => {
                const t = store.todoStore.todos.get("one");
                if (t)
                    t.body = "Sample2";
            }
            return (
                <div>
                    <span>Body: {todo?.body}</span>
                    <button onClick={edit}>Edit</button>
                </div>
            );
        };

        const DefaultApp = observer(App);
        render(<DefaultApp />);
        expect(await screen.findByText(/Body/)).toHaveTextContent("Body: Sample");
        act(()=>screen.getByText('Edit').click());
        expect(await screen.findByText(/Body/)).toHaveTextContent("Body: Sample2");

    });
});
