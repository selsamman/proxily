# Proxily 
> Note:  This project is being actively developped and as such has not yet been published on NPM.  See the road map towards a release at the end. In the mean time it is subject to change.
## Global State Management for React

Proxily is a simple un-opinionated library for managing state across multiple React components.  It re-renders components as state data is changed in a fashion identical to the immutable data pattern.  It does this without any specific requirements on how the state is updated organized or annotated and without relying on redux or immutable patterns. Core features include:
* First class support for Typescript, classes and objects
* Serialization of complex object graphs that may use classes
* Asynchronous semantics through redux-sagas via channels (redux itself not used)
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
If you are updating data outside of the component you must do the updates on a proxy for the data.  This will detect changes and re-render any components that are using useProxy and referencing the data.
```
import {proxy} from 'proxily';

    setTimeout(()=> {
        proxy(state).counter.value++
    }, 1000);
```
### Use of ES6 

proxy and useProxy create and return an ES6 proxy for the object your component uses. This proxy will rerender the component when any property referenced in the render function changes or any child property of the referenced property changes.  The proxy traps all references so it can:

* Note any properties referenced during the course of rendering and re-render when that property changes.
* As child properties are referenced a proxy is substituted so that this behavior is passed down to all child properties.  
* A parent child hierarchy is created such that modifying child properties causes re-rendering of any component referencing parent properties, thus emulating the familiar rules of immutable object reference and shallow comparison as used in redux.

As such Proxily does not support Internet Explorer and requires 0.69 of React-Native
## Usage Patterns

### Moving State Management out of Components
The first example demonstrated that you change your state directly in your component.  Just because you **can** do so does not mean that you **should** do so.

Best practices are to keep state management separate from the component which represents the presentation of that state.  Most frameworks require this through actions. Proxily does not prescribe any specific method of doing this but it is easily achieved by reorganizing state with an object like this:

```javascript
const counter = {
    value : 0,
    increment () {this.value++}
}
const state = {
    counter: Object.create(counter)
};
```
Now the Counter component can assume nothing about the implementation of the counter:
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
### Object Destructuring
Notice that destructuring **increment** from counter worked properly. 
```
const {value, increment} = useProxy(counter);
```

That is because Proxily binds all functions to the target.  Now you can use objects without the consumer having to be aware of the object implementation.

### Classes
Proxily doesn't care whether you use prototypical delegation or classes or pure functions to update your data.  Since it only tracks the data (rather than mutating it) it leaves the creation of objects up to you.
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
Proxily itself is written in Typescript and it's API is fully type-aware.
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
# Serialization
> Note:  Serialization may be moved out of Proxily into it's own library

In the real world state graphs have to be serialized either to kept in local storage or session storage.  With Redux this is straight forward since it used plane old javascript objects that work with JSON.stringify and JSON.parse.  Since Proxily makes it easy to uses classes having a way to serialize them is essential.

There are libraries out there which can help with this like serializr which is often used with MobX.  Supertype, from haven-life also serializes complex objects.  Both require you to describe your schema.  Proxily does not.

Proxily **serialize** converts the object graph to JSON, discovering any objects discovered in the process and noting their constructor in the JSON.  When you call **deserialize**, Proxily does the opposite and re-instantiates the object by class.  You must provide a list of the classes used so that Proxily can call new on the class.  Here is an example structure used by Michel Westrate when serializr was first introduced:
```
class Box {
    uuid = generateUUID();
    x = 0;
    y = 0;
    constructor(x : number, y : number) {
        this.x = x;
        this.y = y;
    }
}

class Arrow {
    uuid = generateUUID();
    from;
    to;
    constructor(from : Box, to : Box) {
        this.from = from;
        this.to = to;
    }
}

class Drawing {
    name = "My Drawing";
    boxes : Array<Box> = [];
    arrows : Array<Arrow> = [];
}
```
Assume it is initialized like this:
```
    const drawing = new Drawing()
    const box1 = new Box(20, 40)
    const box2 = new Box(70, 70)
    const arrow1 = new Arrow(box1, box2)
    drawing.boxes.push(box1, box2)
    drawing.arrows.push(arrow1);
```
To serialize it:
```
const json = serialize(drawing);
```
And to deserialize it:
```
const newDrawing = deserialize(json, [Box, Arrow, Drawing]);
```
There are some constraints on the structure:
You can serialize anything that JSON.stringify/JSON.parse support plus:
* Dates
* Sets
* Maps
* Classes - deserialize will instantiate the class with an empty constructor and then copy over the properties.  Therefore the class must be able to be created with an empty constructor

If you want to manually control the creation of objects or have classes that require specific parameters in the constructor you can also pass a hash of class names and an associated function that will be passed the serialized data from the object and is expected to return the instantiated object.  This hash is the third (optional) parameter.
# Storage Integration
Proxily will integrate with any storage object that supports getItem and setItem.  Specifically this includes localStorage and sessionStorage.  To integrate with storage use persist to read from storage, merge with an initial state, setup a proxy and observe any changes to the proxy and write back to storage
```
const stateProxy = persist(state, {classes: [Class1, Class2]});
```
The first parameter to persist is the intial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration which may include these properties:
* **storageEngine** - Any storage engine that supports getItem and setItem. defaults to localStorage
* **classes** - An array of classes used in the structure just as for deserialize
* **migrate** - A function which is passed the persisted state and the initial state and shoud return the new state.  It might, for example, enhance the persisted state to bring it up-to-date with the current application requirements and then merge it using the default merge routine exported from Proxily

The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays.
```
import {migrate, perist} from 'proxily';
const stateProxy = persist(state, {classes: [Class1, Class2], migrate: myMigrate});
function myMigrate (persist, initial) {
    persist.activeWidgetCount = persist.widgets.filter(w => w.active).length
    return migrate(persist, initial);
}
```
# Sagas
Asynchronous behavior is an important part of many React applications.  In Redux you have thunks and in Proxily any method can be async and make use of promises.  Sometimes organizing complex behavior can be simplified by using generators and redux-saga has a rich tool-kit for doing so.  Fortunately it can be used without Redux itself using the channel API.

Proxily provides a wrapper around redux-saga that facilitates it's use without a redux store.  While Redux is based on "listening" for actions, Proxily is oriented towards a top-down call structure where generator tasks are scheduled. **scheduleTask** accomplishes this by:
* Calling runSaga on a dispatching saga for your task
* You choose the effect (takeEvery, takeLeading, takeMaybe, debounce, throttle). 
* Only one dispatching saga is instantiated for each task/effect combination.  Note that with objects each instance of a task counts as a task.
* The dispatching saga will run until it is cancelled by calling **cancelTask**
* The dispatching saga takes from a channel rather than taking an action pattern.
* After setting up the dispatching saga (if not already running), **shceduleTask** emits to the channel a value that the saga can take and process each time **scheduleTask** is called.

Sagas are object and class friendly because the sagas, which are member functions, are automatically bound by Proxily to their target object.
```
class Container {
    *task({interval} : {interval : number}) {
        yield delay(interval);
    }
    invokeTask () {
        scheduleTask(this.task,{interval: 1000}, takeLeading); //sequentialize
    }
}
const container = proxy(new Container());
container.invokeTask();
```
If using an effect that takes a time parameter like throttle or debounce you can pass it in:
```
scheduleTask(this.task, {interval: 1000}, debounce, 500);
```
If you wish to cancel a task's dispatching saga you can do so like this:
```
 cancelTask(this.task, takeLeading);
```
And if you want a more exotic use of sagas just pass in your own effect.  Here is the example for takeEvery
```
const takeLeadingCustom = (patternOrChannel:any, saga:any, ...args:any) => fork(function*() {
    while (true) {
        const action : any = yield take(patternOrChannel);
        yield call(saga, ...args.concat(action));
        console.log("foo");
    }
})
...
scheduleTask(this.task, {interval: 1000}, takeLeadingCustom);

```
You must include redux-saga into your project and import **scheduleTask** and **cancelTask** from proxily/sagas
# Transactions
### Overview
A Transaction creates a forked environment in which updates are made.  You may then commit the forked environment which makes the updates visible outside of the transaction or roll them back.  This allows you to "cancel" changes without necessarily losing other asynchronous updates such as those that are streamed from a server.

When you create a transaction you get a new proxy and as you navigate through the data in that proxy the references you get are also part of the transaction.  Any code or component holding references to the original proxy will not see your updates until you commit them.  This is essentially the same paradighm that a database uses to control the updating of data.

In addition to being able to roll back you can also "undo" each update or creation roll-back points to roll back to a particular point in the transaction.  Proxily tracks Updates based on calls to functions which are proxied.  Only the outer call is considered and "update" such that you never end up with intermediate states which could be invalid.

When running in debug with the redux devtools extension, your main environment is also a transaction and Proxily will create roll-back points for every outer method call which corresponds to actions.  You can then time-travel using the tool to place your application in any previous state.

### Use Cases
Forking the stat is not a common feature of state management libraries so here are a few common use cases where it can simplify applications and provide features that are otherwise hard to implement:

* ***Asynchronous updates*** - Often server updates take several calls before a complete set of data is available.  Rather than putting intermediate data in the store which can impact integrity most applications will store up the results and then update the state when all calls have succeded. Forking the state allows the state to be updated as the call results are received.  If an operation fails both the saga controlling the server interaction and the partial updates to state can be rolled back.
  
* ***Complex User Interactions*** - Sometimes a user interface requires a series of steps to complete.  Rather than updating the state at each step which is the simplist solution, components often store intermediate state locally until the steps are complete. With state forking the application doesn't need to worry about this and can use the normal process for updating the pieces of the state as the user goes along, knowing that the updates won't be visibile until the end. Examples might include:
  * Modal dialogs that implement a cancel / OK button
  * Creating a new chat message which must have a recipient, subject and text to be complete
  * Filling out a form where there are required fields
    
* ***Undo/Redo*** - Some user interfaces require and undo/redo button.  While other libraries allow for this what Proxily can do is to limit the scope of the undo/redo to a single subject area using transactions.  Undoing an operation would not, for example, undo any data recieved from the server during the course of user interaction

### Creating a Transaction

A transaction is created by creating a new proxy for the root of the state where you want to begin forking the state.  This is usually the part(s) of the state graph that pertain to the specific update.  It is important that all proxy references are either references stemming from that proxy or created explicity to be part of that transaction.
```
function updatePrimaryAddress () {

const [updateAddress] = useState(new Transaction());
const {phones} = useProxy(customer, updateAddress);
const phone = phones.find(a = a.type === 'primary');

return (
    <input type="text" value={phone.number} onChange={(data) => phone.updateNumber(data)} />
    {phone.isValid ? 
        <button label="update" onPress=updateAddress.commit() />
    }
)

```
Here we create the transaction and incorporate it into our proxy.  Because phone is derived from phone which is derived from customer, the proxy for phone will also be part of the transaction.  Once the isValid getter returns true, the phone number transaction can be committed.
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
* Both make no assumptions about your data (with the exception of classes)

The differences are:
* Immer actually makes your state immutable whereas Proxily does not. 
* Immer requires that modifying the state use the producer pattern
* Immer requires that you annotate classes

### Summary
We build on the shoulders of giants. Redux and MobX are both very effective mechanisms for reacting to state changes.  With Redux, you can setup your parent component to reference objects that can then be passed into sub-components without them having to be redux-specific.  With MobX you really need to have sub-components be observable since higher level components will only re-render when properties they reference change.

Proxily is an attempt to reproduce that more liberal reaction paradigm where children impact their parents but without the need for reducers or prescriptions on the structure of your data or patterns for updating it.  In fact Proxily goes further than MobX an make no assumptions about your data other than that the highest level must be via a proxy.  

In short the main goal of proxily is to allow parts of your application to have know knowledge of the fact that they are part of a react-app.  This permits external data structures or pre-existing code to co-exist with react.  The pattern you use is up to you and while we recommend you pick a pattern and stick to it the choice is yours.
# Roadmap
Presently Proxily is at the proof of concept phase.  The steps to a production-ready library are as follows:
* [x] Addition of annotations for memoization
* [x] Serialization
* [x] redux-saga integration  
* [x] Storage integration
* [x] Extensive tests for core-functionality
* [ ] Patterns of Usage Example
* [ ] Full Documentation
* [ ] Feedback from community

In the meantime please feel free to kick the tires.


