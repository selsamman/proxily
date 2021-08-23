
// Each root element (makeObservable) is recorded
import {Transaction} from "./Transaction";
import {Target} from "./proxyObserve";
import {Observer} from "./Observer";
let maxAge = 50;

// Every high level object that subject to makeObservable is going to be reported in state
const rootTargets : Set<Target> = new Set();
const transactions : Set<Transaction> = new Set();

// value returned from devTools.connect();
let devTools : any;

// actions are just a list of values for each object at the point when the state is saved
const actions : Array<Map<Target, any>> = [];
let firstAction = -1;
let lastAction = -1;

// --- Connect to redux_devtools and handles incoming messages to goTo a particular state
export function configureReduxDevTools(options? : any) {
    if (typeof window === "object" && (window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__
        && (window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__.connect) {
        if (!options)
            options = {};
        if (!options.maxAge)
            options.maxAge = maxAge;
        maxAge = options.maxAge;

        devTools = (window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__.connect(options)

        devTools.subscribe((message : any) => {
            if (message.payload && typeof message.payload.actionId === 'number')
            restoreState(message.payload.actionId * 1);
        });

        return devTools;
    }
}

// --- Send out the initial state using the devtools init call

export function initReduxDevTools() {
    if (devTools && Transaction.defaultTransaction) {
        saveState();
        devTools.init(getState(Transaction.defaultTransaction));
    }
}

// --- functions to maintain the list of all root state objects

export function addRoot(target : Target) {
    if (devTools)
        rootTargets.add(target);
}
export function isRoot(target : Target) {
    return rootTargets.has(target);
}

export function removeRoot(target : Target) {
    if (devTools)
        rootTargets.delete(target);
}

// --- Manage transactions

export function addTransaction(transaction : Transaction) {
    transactions.add(transaction);
}

export function removeTransaction(transaction : Transaction) {
    transactions.delete(transaction);
}

// --- Manage the sending of actions only if the action actually modified data (isDirty)

let isDirty = false;

export function startHighLevelFunctionCall(_target: Target, _name : string) {
    isDirty = false;
}

export function setDirty () {
    isDirty = true;
}

export function endHighLevelFunctionCall(target: Target, name : string) {
    if (devTools && isDirty) {
        saveState();
        devTools.send(name, getState(target.__transaction__));
    }
}

// --- Retrieve the state by constructing an index object of all rootStates and naming them using their
//     constructor (class) name with unique suffixes and a Transaction label for those in a transaction

interface ObjectName {  // instance of constructor name
    instances: WeakMap<Target, number>;  // All targets for that constructor name
    nextSeqNumber : number       // Count of targets added to above set
}

const objectNames : Map<string, ObjectName> = new Map();
export function getState(transaction : Transaction) : any {
    const state = {
        __sequence__ : transaction.updateSequence
    }

    rootTargets.forEach(target => {
        let name = target.constructor?.name || "Object";
        if (target.__transaction__ !== Transaction.defaultTransaction)
            name = "Transaction_" + name;
        let objectName = objectNames.get(name);
        if (!objectName) {
            objectName = {
                instances: new WeakMap(),
                nextSeqNumber: 1
            }
            objectNames.set(name, objectName);
        }
        let seq = objectName.instances.get(target);
        if (typeof seq === 'undefined') {
            seq = objectName.nextSeqNumber;
            objectName.instances.set(target, seq);
            ++objectName.nextSeqNumber;
        }
        if (objectName.nextSeqNumber > 2)
            name = name + seq;
        state[name] = target;
    });
    return state;
}

// --- Save the state by replicating the state graph of all root objects + the transaction

function saveState() {

    // Get the transactions values and root targets at time of snapshot
    const values : Map<Target, any> = new Map();

    // Get the values for each target in case they changed since snapshot
    transactions.forEach( transaction => getProxyTargetProps(transaction, values));
    rootTargets.forEach(target => getProxyTargetProps(target, values))

    // Manage list of actions so we only keep the maximum amount
    actions[++lastAction] = values;
    firstAction = Math.max(firstAction, 0);
    if ((lastAction - firstAction) > maxAge)
        delete actions[firstAction++]
}

// Get all the values and stuff them into a map so we can freshen up targets on state restore
function getProxyTargetProps(target : any, valueMap : Map<Target, any>) {

    if (target instanceof Transaction)
        return target.getState();

    target = target.__target__ || target; // Only want the targets not the proxies

    // Deal with circular references
    if (valueMap.has(target))
        return target;

    // Get values for this target and recurse into next
    let values = {};
    valueMap.set(target, values);

    // get values of object
    let prop;
    for(prop in target)
        values[prop] = getPropValue(target[prop], valueMap);
}

// Make a careful copy of the values depending on the type of object
function getPropValue(value : unknown, valueMap : Map<Target, any>) {
    let newValue : unknown;
    if (value instanceof Date)
        newValue = new Date(value.getTime());
    else if (value instanceof Array)
        newValue = value.map(value => getPropValue(value, valueMap));
    else if (value instanceof Map) {
        newValue = new Map();
        (value as Map<any, any>).forEach(
            (prop : any , key : any) =>
                (newValue as Map<any,any>).set(key, getPropValue(prop, valueMap)));
    } else if (value instanceof Set) {
        newValue = new Set();
        (value as Set<any>).forEach(value => (newValue as Set<any>).add(getPropValue(value, valueMap)));
    } else if (typeof value === 'object' && value !== null  && !(value instanceof WeakMap)) {
        newValue = value;
        getProxyTargetProps(value, valueMap);
    } else
        newValue = value;
    return newValue;
}

// --- Restore the state

function  restoreState(id : number) {
    const contexts : Set<Observer> = new Set();
    if (id >= firstAction) {
        const values = actions[id];
        values.forEach( (values, target) => {
            assignValues(target, values)
            if (target.__contexts__)
                target.__contexts__.forEach(context => contexts.add(context))
        });
        contexts.forEach(context =>
            context.changed(undefined, "*", false));
    }
}

function assignValues(obj : any, props : any) {
    if (obj instanceof Transaction)
        obj.setState(props)
    else {
        let prop;
        for (prop in props) {
            obj[prop] = getValue(props[prop]);
        }
        // delete any props that were non-existent at time of snapshot
        for (prop in obj)
            if (typeof props[prop] === 'undefined')
                delete obj[prop];
    }
}
function getValue(value : unknown) {
    let newValue : unknown;
    if (value instanceof Date)
        newValue = new Date(value.getTime());
    else if (value instanceof Array)
        newValue = value.map(value => getValue(value));
    else if (value instanceof Map) {
        newValue = new Map();
        (value as Map<any, any>).forEach(
            (prop : any , key : any) => (newValue as Map<any,any>).set(key, getValue(prop)));
    } else if (value instanceof Set) {
        newValue = new Set();
        (value as Set<any>).forEach(value => (newValue as Set<any>).add(getValue(value)));
    } else
        newValue = value;
    return newValue;
}
