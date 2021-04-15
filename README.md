# Proxily (Alpha)
##Global State Management for React

Proxily is a simple un-opinionated library for managing state across multiple React components.  It re-renders components as state data is changed in a fashion identical to the immutable data pattern.  It does this without any specific requirements on how the state is updated.
### Just call useProxy

```javascript
import React from 'react';
import {useProxy, makeProxy} from 'proxily';

const state = {
  counter: {value: 0}
};

function App() {
  const  {counter} = useProxy(state.counter);
  return (
    <div>
      <span>Count: {counter.value}</span>
      <button onclick={()=>counter.value++}>Increment</button>
    </div>
  );
}

export default App;
```
### How does that work?

useProxy creates and returns an ES6 proxy for the object your component uses. This proxy will rerender the component when any referenced property in the proxy changes or any child property of the proxy changes.  The proxy traps all references so it can:

* Note any properties referenced during the course of rendering.
* When any property (or child property) is modified, the noted component referencing that property is re-rendered.
* As child properties are referenced a proxy is substituted so that this behavior is passed down to all child properties
* A parent child hierarchy is maintained such that modifying child properties causes the re-rendinging of components referencing thier parents, thus emulating the rules of immutable object reference comparrison as used with react and redux.
## Memoization
Anyone using redux for state management can take advantage of memoization which reduces costly recalculation of derived state information every time you reference the derived state.  Proxily make it easy to do memoization in any function within a proxied object using the memo function:
```
const state = {
    counters: [counter, counter],
    sortedCounters: {
       this.counters.splice(0).sort((a,b) => a.value - b.value)
    };
};
memoizeObject(state, 'sortedCounters');
```
memoizeObject simply records the value and recalculates it if any of the proxied values changes.
## Usage Patterns

### Moving State Management out of Components
The first example demonstrated that you change your state directly in your component.  Just because you **can** do so does not mean that you **should** do so.

Best practices are to keep state management separate from the component which represents the presentation of that state.  Proxily does not prescribe any specific method of doing that but it is easily achieved by reorganizing state to be:

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
      <button onclick={increment}>Increment</button>
    </div>
  );
}
function App () {
    return (
        <Counter counter={state.counter}/>
    );
}
```
### This seems a lot like MobX
Yes there are important similarities:
* Both use a proxy to monitor changes to your data
* Both can force the re-render of a component when data changes
* They both allow great freedom in how you update your state and structure your data

The main differences are:
* Proxily is designed for React functional components and uses the more familiar 'use' semantics rather than wrapping components in an observable call.
* Only the properties in your state that are consumed during the course of the render will cause a re-render when changed.
* Proxily makes few assumptions about your data.  You don't have to make it observable.  All you need is to call useProxy when consuming the data.  This works with sub-classing as well.
* Uses a memo methodology for specific functions or getters that return data derived from sthat that is expensive to compute.  If functions are used the parameter values are memoized as well.
* Does not implement transactions since in rReact redundant renders are automatically optimized out.

