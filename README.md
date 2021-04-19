# Proxily (Proof of Concept)

## Global State Management for React

Proxily is a simple un-opinionated library for managing state across multiple React components.  It re-renders components as state data is changed in a fashion identical to the immutable data pattern.  It does this without any specific requirements on how the state is updated.
### Call useProxy in a Component
useProxy will track any changes in state and re-render your component.
```javascript
import React from 'react';
import {useProxy} from 'proxily';

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

export default App;
```
### Call proxy elsewhere
If you are updating data outside of the component you must do the updates on a proxy for the data.  This will detect changes and re-render any components that are using useProxy and refererencing the data.
```
import {proxy} from 'proxily';

    setTimeout(()=> {
        proxy(state).counter.value++
    }, 1000);
```
### How does that work?

proxy and useProxy create and returns an ES6 proxy for the object your component uses. This proxy will rerender the component when any property referenced in the render function changes or any child property of the referenced property changes.  The proxy traps all references so it can:

* Note any properties referenced during the course of rendering.
* When any property (or child property) is modified, the component is re-rendered.
* As child properties are referenced a proxy is substituted so that this behavior is passed down to all child properties.  This is done in the proxy itself such that the original data is unchanged
* A parent child hierarchy is created such that modifying child properties causes  re-rendering of the component, thus emulating the rules of immutable object reference comparison as used in redux.

## Usage Patterns

### Moving State Management out of Components
The first example demonstrated that you change your state directly in your component.  Just because you **can** do so does not mean that you **should** do so.

Best practices are to keep state management separate from the component which represents the presentation of that state.  Most frameworks require this through actions. Proxily does not prescribe any specific method of doing that but it is easily achieved by reorganizing state to be:

```javascript
const counter = {
    value : 0,
    increment () {this.value++}
}
const state = {
    counter: counter
};
```
which let's the Counter component assume nothing about the functionality of the counter:
```javascript
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
```
### Wait. Why did that work?
Why didn't the this.value++ fail because we call increment without a an object reference (e.g. counter.increment)? Proxily binds all function references so you can freely dereference to the target option so you can use them like standalone functions.
### Prefer Classes?
```
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
```
Classes also offer away to enforce state not being updated within components or other code not associated with the store.  You simply make the properties private or protected.
## Memoization
Anyone using redux for state management can take advantage of memoization which reduces costly recalculation of derived state information every time you reference the derived state.  Proxily make it easy to do memoization in any function using **memoizeObject** and **memoizeClass**. using the memo function:
```
const state = {
    counters: [counter1, counter2],
    sortedCounters: function () {
        return this.counters.slice(0).sort((a,b) => a.value - b.value);
    }
};
memoizeObject(state, 'sortedCounters'); 
```
or to memoize a method within a class:
```
class State {
    constructor () {
        this.counters = [new CounterClass(), new CounterClass()];
    }
    counters : Array<CounterClass> = [];
    sortedCounters () {
        return this.counters.slice(0).sort((a,b) => a.value - b.value);
    }
};
memoizeClass(State, 'sortedCounters');
```
or with Typescript decorators
```
class State {
    constructor () {
        this.counters = [new CounterClass(), new CounterClass()];
    }
    counters : Array<CounterClass> = [];
    @memoize()
    sortedCounters () {
        return this.counters.slice(0).sort((a,b) => a.value - b.value);
    }
};
```
# Design Goals

### Similarities to MobX
Proxily shares many similarities with MobX:
* Both use a proxy to monitor changes to your data
* Both can force the re-render of a component when data changes
* Both allow great freedom in how you update your state and structure your data

The main differences are:
* Proxily supports functional components with 'use' semantics rather than having to wrap components in a high-order observer component.
* Proxily does not require any special treatment of objects and references (e.g. make them all observable). Consuming any kind of data with useProxy is all you need. 
* MobX re-renders when the specific properties referenced in render change.  Proxily also re-renders when children of referenced properties are changed.

### Similarities to Redux
The similarities are:
* Both support 'use' semantics for functional components
* Both support the principal that changes to child properties are considered as changes to their parents (inherent in immutability)

The differences are obviously in the semantics.  Proxily works on ordinary objects whereas Redux relies on immutability which is implemented using reducers.
### Similarities to Immer
The similarities are: 
* Both use the same rules of immutability for tracking changes to child properties
* Both make no assumptions about your data

The differences are:
* Immer actually makes your state immutable whereas Proxily does not. 
* Immer requires that modifying the state using the producer pattern

### Summary
We build on the shoulders of giants. Redux and MobX are both very effective mechanisms for reacting to state changes.  With Redux, you can setup your parent component to reference objects that can then be passed into sub-components without them having to be redux-specific.  With MobX you really need to have sub-components be observable since higher level components will only re-render when properties they reference change.

Proxily is an attempt to reproduce that more liberal reaction paradigm where children impact their parents but without the need for reducers or prescriptions on the structure of your data or patterns for updating it.  In fact Proxily goes further than MobX an make no assumptions about your data other than that the highest level must be via a proxy.  Proxily will never modify your data and does its job entirely through ES6 proxies.

In short the main goal of proxily is to allow parts of your application to have know knowledge of the fact that they are part of a react-app.  This permits external data structures or pre-existing code to co-exist with react.  The pattern you use is up to you and while we recommend you pick a pattern and stick to it the choice is yours.
# Roadmap
Presently Proxily is at the proof of concept phase.  The steps to a production-ready library are as follows:
* [x] Addition of annotations for memoization
* [ ] Serialization and storage integration
* [ ] Extensive tests for core-functionality
* [ ] Patterns of Usage Example
* [ ] Full Documentation
* [ ] Feedback from community

Any the mean time please feel free to kick the tires.


