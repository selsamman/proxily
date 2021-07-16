# Proxily 
> Note:  This project is being actively developped and as such has not yet been published on NPM.  See the road map towards a release at the end. In the mean time it is subject to change.
## Global State Management for React

Proxily is a library for managing state in a non-prescriptive way. It re-renders components as state changes. While Proxily does not use immutable state it provides many of the same benefits. There is no need to annotate or describe the state shape as Proxily will discover it as navigates through the state hierarchy. Core features include:

* Follows the same dependency pattern as immutable state in that a change to a child object constitutes a change to its parent.
* Serialization of complex state including cyclic data and classes
* Asynchronous semantics through redux-sagas generators and take helpers
* Time travel (undo, redo) in applications (and soon using redux debugger plugin)
* State forking allowing a separate fork of the state to be committed upon completion
* First class support for Typescript, classes and objects

## Usage
Make the top level object in your state observable with **makeObservable**:
```javascript
import {makeObservable} from 'proxily';

export const state = makeObservable({
  counter: {value: 0}
});
```
Place **useObservables** at the start of your component's render:
```javascript
import {useObservables} from 'proxily';
import {state} from 'myState';

function App() {
    useObservables();
    const  {counter} = state;
    return (
        <div>
            <span>Count: {counter.value}</span>
            <button onClick={()=>counter.value++}>Increment</button>
        </div>
    );
}
```
Proxily will track references to your observable state that occur during the render (counter.value) and re-render the component when they change.  

### How does it work?

Although you don't need to know all of the details Proxily performs it's magic using ES6 proxies.  makeObservable creates a proxy for the highest level object in your state.  Then as you reference further into your state object heirarchy, Proxily will replace references to deeper objects with references to a proxy for the referenced object. This way you don't need to annotate all of the objects as proxily will "discover" the relationships as you reference the heirarchy.  The proxies will notify any components that contain **useObserverables** when properties they reference change.  Other parts of your application outside of components may also observe changes to your state.


Because it's use of ES6 Proxily does not support Internet Explorer and requires 0.69 of React-Native.  Proxily is written in Typescript and targets ES6. Therefore, you might as well target ES6 in your applications that use ES6.  This results in far less transpilation and makes debugging easier.

## Function Binding
The first example demonstrated that you change your state directly in your component.  Just because you **can** do so does not mean that you **should** do so. Best practices are to keep logic separate from the component.  One option is in the state itself by including an increment function

```javascript
const counter = makeObservable({
    value : 0,
    increment () { this.counter++ }
});
```
Now the Counter component can assume nothing about the implementation of the counter:
```javascript
function Counter({counter}) {
    useObservables();
    const {value, increment} = counter;
    return (
        <div>
            <span>Count: {value}</span>
            <button onClick={increment}>Increment</button>
        </div>
    );
}
function App () {
    useObservables();
    return (
        <Counter counter={counter}/>
    );
}
```
Notice that destructuring **increment** from counter worked properly. 
```
const {value, increment} = counter;
```
That is because Proxily binds all functions to the target on observable objects.  Now you can use objects without the consumer having to be aware of the object implementation.  Having to bind object functions to the objectis a key pain-point with using objects and classes which Proxily eliminates.

## Classes
Proxily doesn't care whether you use prototypical delegation or classes or pure functions to update your data.  Since it only tracks the data (rather than mutating it) it leaves the creation of objects up to you.  However, Proxily does have full support for Typescript enabling you to create a type safe store.  All of the custom hooks are fully type aware such that types are inferred.

Typescript give you a mechanism to create your own rules such as never allowing state to be updated outside of the store.
```
class CounterState {
    private value = 0;  // Can't update value directly
    increment () {this.value++}
}
const state = makeObservable({
    counter: new CounterState()
});

function Counter({counter} : {counter : CounterState}) {
    useObservables();
    const {value, increment} = counter;
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
## Memoization
Memoization which reduces costly recalculations based on your state by saving the result and only re-running the calculation when dependent state is changed.  Both getters (akin to selectors) and functions with arguments are supported:  You need only annotate an object function with **memoizeObject** and **memoizeClass**.
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
or with Typescript decorators (with "experimentalDecorators": true in your tsconfig file)
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
## Serialization
What is the point of state if you can't keep it around.  With Redux this is straight forward since you are limited to plane old javascript objects that work with JSON.stringify and JSON.parse.  Proxily allows complex objects including classes to be serialized.

Proxily **serialize** converts the object graph to JSON, discovering any objects discovered in the process and noting their constructor in the JSON.  When you call **deserialize**, Proxily does the opposite and re-instantiates the object graph.  With classes you must provide a list of the classes used so that Proxily can call new on the class.  Here is an example structure:
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

serialize cannot process objects containing functions unless they use classes as there is no way to know how to reconstitute them.
## Storage Integration
Proxily will integrate with any storage object that supports getItem and setItem.  Specifically this includes localStorage and sessionStorage.  To integrate with storage use **persist** to read from storage, merge with an initial state, set up a proxy and observe any changes to the proxy and write back to storage
```
const stateProxy = persist(state, {classes: [Class1, Class2]});
```
The first parameter to persist is the intial state which is any structure supported by Proxily including plane objects or class based hierarchies.  The second parameter is the configuration which may include these properties:
* **storageEngine** - Any storage engine that supports getItem and setItem. defaults to localStorage
* **classes** - An array of classes used in the structure just as for deserialize
* **migrate** - A function which is passed the persisted state and the initial state and shoud return the new state.  It might, for example, enhance the persisted state to bring it up-to-date with the current application requirements and then merge it using the default merge routine exported from Proxily

The default migration logic will merge initial and persistent states giving preference to the persistent state.  It will merge multiple levels up to but not including properties of built-in objects or Arrays.
```
import {migrate, persist} from 'proxily';
const stateProxy = persist(state, {classes: [Class1, Class2], migrate: myMigrate});
function myMigrate (persist, initial) {
    persist.activeWidgetCount = persist.widgets.filter(w => w.active).length
    return migrate(persist, initial);
}
```
Note:  persist will also make the state returned observable so there is no need to additionally call makeObservable.
## Generators & Sagas
Asynchronous behavior is an important part of many React applications.  In Redux, you have thunks and in Proxily any method can be async and make use of promises.  Sometimes organizing complex behavior can be simplified by using generators and redux-saga has a rich tool-kit for doing so.  Fortunately it can be used without Redux itself using the channel API.

Proxily provides a wrapper around redux-saga that facilitates it's use without a redux store.  While Redux is based on "listening" for actions, with Proxily you start with a generator function that can have multiple yields for each asynchronous step of the task.  This represents a type of task that can be scheduled 
```
  function *worker({interval, type} : {interval : number, type : string}) {
      yield delay(interval);
      // Do something
  }
```
You then schedule an instance of that task
```
  scheduleTask(worker, {interval: 150, type: 'A'}, takeEvery);
```
The parameters are passed as an object and our received in the task function.

When you schedule it you chose one of the take helpers such as takeEvery, takeLeading, debounce, throttle to indicate how the scheduling should deal with concurrent invocation of the task.  See the redux-saga documentation on how these work in detail.  The high level summary is:

* **takeEvery** - Allow concurrent execution of the task as it scheduled
* **takeLeading** - Ignore requests to schedule the task while first instance of the task is in process
* **takeLatest** - Cancel any running task instance of the task when a new instance is scheduled
* **debounce** - Wait x milliseconds before running ignoring any others scheduled in that interval

**scheduleTask** just uses redux-saga functions to schedule the task by
* Calling runSaga on a dispatching saga for your task
* The dispatching saga then yields on the helper passing it the generator task itself. 
* It then yields waiting to be cancelled. 
* There is one dispatching saga for each generator function and effect combination.
* The dispatching saga will run until it is cancelled by calling **cancelTask**
* The dispatching saga takes from a channel rather than taking an action pattern.
* The dispatching saga uses Channels and EventEmitters to feed the take helper

Sagas are object and class friendly because the sagas, which are member functions, are automatically bound by Proxily to their target object.
```
class Container {
    *task({interval} : {interval : number}) {
        yield delay(interval);
    }
    invokeTask () {
        scheduleTask(this.task, {interval: 1000}, takeLeading); //sequentialize
    }
}
const container = makeObservable(new Container());
container.invokeTask();
```
If using an effect that takes a time parameter like throttle or debounce you can pass it in:
```
scheduleTask(this.task, {interval: 1000}, debounce, 500);
```
You can cancel a task if you don't want it to run for the duration of your application.  You must pass the same take helper since this is used to locate the task:
```
 cancelTask(this.task, takeLeading);
```
And if you want a more exotic use of sagas just pass in your own take effect.  Here is the example for takeEvery
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
You must add redux-saga to your project and import **scheduleTask** and **cancelTask** from proxily/lib/cjs/sagas.
## Transactions & State Forking
### Overview
A Transaction creates a forked environment in which updates are made.  You may then commit the forked environment which makes the updates visible outside of the transaction or roll them back.  This allows you to "cancel" changes without necessarily losing other asynchronous updates such as those that are streamed from a server.

When you create a transaction you get a new proxy and as you navigate through the data in that proxy the references you get are also part of the transaction.  Any code or component holding references to the original proxy will not see your updates until you commit them.  This is essentially the same paradigm that a database uses to control the updating of data.

In addition to being able to roll back you can also "undo" each update or roll-back or roll-forward to a particular point in the transaction.  Proxily tracks state updates based on calls to functions which are proxied.  Only the outer calls are considered to be an update.  This way you never end up with roll-back points that represent invalid intermediate states.

When running in debug with the redux devtools extension, your main environment is also a transaction and Proxily will create roll-back points for every outer method call which corresponds to actions.  You can then time-travel using the redux dev tools to place your application in any previous state.

### Use Cases
Forking the state is not a common feature of state management libraries.  To understand the benefits, here are a few common use cases:

* ***Asynchronous updates*** - Often updates from the server take several calls to complete and data is delivered in pieces.  Rather than putting intermediate data in the store which can impact integrity most applications will store up the results and then update the state when all calls have succeeded. Forking the state allows the state to be updated as each call to the server is completed.  If the operation as a whole fails, the saga controlling the server interaction and the partial updates can both be cancelled.
  
* ***Complex User Interactions*** - Sometimes a user interface requires a series of steps to complete.  Rather than updating the state at each step which is the simplist solution, components often store intermediate state locally until the steps are complete. With state forking the application doesn't need to worry about this and can use the normal process for updating the pieces of the state as the user goes along, knowing that the updates won't be visibile until the end. Examples might include:
  * Modal dialogs that implement a cancel / OK button
  * Creating a new chat message which must have a recipient, subject and text to be complete
  * Filling out a form where there are required fields
    
* ***Undo/Redo*** - Some user interfaces require an undo/redo button.  While other libraries allow for this as well, what Proxily can do is to limit the scope of the undo/redo to a single subject area using transactions.  Undoing an operation would not, for example, undo any data received from the server during the course of user interaction.

### Creating a Transaction

To use a transaction in a component follow these steps:
* Place **useObervables** as usual at the start of your render
* Create the transaction with **new Transaction**.  Ensure it is only created once per component by passing a function to useState that will create the transaction
* Create a copy of your data by calling **useTransactable**, passing it the original object and consuming the object returned.  This is only needed for the top level object(s) as Proxily will automatically do this for subordinate objects you reference.
* Call commit() or rollback() on the transaction when the user interaction is complete
```
function UpdateCustomer ({customer} : {customer : Customer}) {
    useObservables();
    const [updateAddressTxn] = useState(() => new Transaction());
    customer = useTransactable(customer, updateAddressTxn);
    const {name, phone, setName, setPhone} = customer;
    return (
        <>
            <input type="text" value={name} 
                   onChange={(e) => setName(e.target.value)} />
            <input type="text" value={phone} 
                   onChange={(e) => setPhone(e.target.value)} />
            <button onClick={() => updateAddressTxn.commit()} >Commit</button>
            <button onClick={() => updateAddressTxn.rollback()} >Rollback</button>
        </>
    )
}

```
Sometimes a transaction may span multiple components.  In that case you can either create the transaction in the highest level component and pass it down via parameters or use **<TransactionProvider>** 
```
import {TransactionProvider} from 'proxily';
function App () {
    return (
        <TransactionProvider>
            <UpdateCustomer customer={customer} />
        </TransactionProvider>
    )
}
```
With **<TransactionProvider>** you can then reference the transaction in your transaction with useContext rather than creating it in the component
```
import {TransactionContext} from 'proxily';
...
const updateAddressTxn = useContext(TransactionContext);
```

### Transaction Object

The transaction objected produced by new Transaction has a number of functions and properties available to it.
* ***updateSequence*** - An update sequence number representing the current state.  This value can be used to remember a point in time and then you can roll back the state to that point in time using ***rollTo***.  
* ***rollTo(updateSequence : number)*** - Roll back or forward the transaction to a specific point.
* ***rollback()*** - Roll back the transaction by discarding all changes since the creation or the last rollback.
* ***commit()*** - Commit the changes in the transaction so they are visibile outside of the transaction.
* ***undo()*** - Go back to the previous sequence number that represents the state at the start of a call to the outermost function.
* ***redo()*** - Go forward to the next sequence number that represents the state at the start of a call to the outermost function.
* ***canUndo*** - returns true if the undo function can be executed
* ***canRedo*** - returns true if the redo function can be executed

### How time positioning in transactions works ###

Time position (undo/redo/rollTo) is implemented by internally creating an array of function pairs that can undo/redo each update.  The current position in that array (normally the last entry) is the ***updateSequence** property in the Transaction object.  When you position backwards (undo() or rollback() to a lower number), Proxily executes the functions one at a time until you reach the desired sequence number.  At that point one of two things can happen:
* You reposition again
* You preform a state update

In the later case the current position becomes the last entry in this array by deleteing all later entires.  Thus if you ***undo*** or ***rollTo** and make further state changes you can can never go further forward in time.

A ***rollback*** does not use the array of undo/redo functions.  Instead it simply updates all the of the target objects to the state of main store.

### Requesting incremental time positioning

Since implementing the internal undo/redo list has a performance impact on memory it is not turned on by default.  To enable it you create a transaction with TimePositioning as an option:
```
import {Transaction, TransactionOptions} from 'proxily';

const txn = new Transaction ({TransactionOptions.TimePostioning: true});
```
### Update Anomalies ###

When you commit you override any changes made outside the transaction that are made during the timespan between creating the transaction and commiting.  This applies, however, only to data (objects) that you reference in the transaction.  Therefore we recommend that you ensure that overlapping parts of the state are not simultaneously updated inside and outside of the transaction.

Proxily applies a very simple forking mechanism to transactions.  
* Proxily makes a copy of each object (using Object.create and Object.assign) as you reference it.  This includes built-ins such as Array, Map, Set and Date.  This copy becomes your new proxy during the course of the transaction.
* When you commit it copies the data back to the original
* When you rollback it copies the data from the original to the transaction copy
  
While this works in most circumstances there are some anomalies to be aware of:
* Under some circumstances changes stemming from the commit will be moot.  For example if you update the address of a customer that you deleted outside the transaction, the customer will remain deleted even if you commit the changes to update its address.
* Since Proxily copes the entirety of an Array, Map, Set and Date objects, any element updated in a transaction will overwrite any other changes in that object made outside of the transaction.
* Changes made outside the transaction are isolated from the transaction as long they occur after the data has been referenced in the transaction.  This general works well since one usually creates the transaction in the course of the first render.  
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

Proxily is an attempt to reproduce that more liberal reaction paradigm where children impact their parents.  It does this without the need for reducers or prescriptions on the structure of your data or patterns for updating it.  In fact Proxily goes further than MobX an make no assumptions about your data other than that the highest level must be via a proxy.  Rather than having to annotate the structure of your data, Poxily infers it from how the data is referenced.  The only annotation required is to indicate which functions should be memoized.

In short the main goal of proxily is to allow parts of your application to have know knowledge of the fact that they are part of a react-app.  This permits external data structures or pre-existing code to co-exist with react.  The pattern you use is up to you and while we recommend you pick a pattern and stick to it the choice is yours.
# Roadmap
Presently Proxily is at the stage of functional completeness with good test coverage.  The steps to a production-ready library are as follows:
* [x] Addition of annotations for memoization
* [x] Serialization
* [x] redux-saga integration  
* [x] Storage integration
* [x] Transactions & state forking
* [x] Extensive tests for core-functionality
* [ ] Sample App
* [ ] Publish on NPM  
* [ ] Patterns of Usage Example
* [ ] Full Documentation
* [ ] Feedback from community

In the meantime please feel free to kick the tires.


