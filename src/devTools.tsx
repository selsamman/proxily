
// Each root element (makeObservalbe) is recorded
import {Transaction} from "./Transaction";
import {ProxyTarget, Target} from "./proxyObserve";
const maxAge = 50;

// Every high level object that subject to makeObservable is going to be reported in state
export const rootTargets : Set<Target> = new Set();

// value returned from devTools.connect();
let devTools : any;

interface actionEntry {
    transaction: Transaction;
    targets: Map<Target, Target>;
}

const actions : Array<actionEntry> = [];
let firstAction = -1;
let lastAction = -1;

// --- Connect to redux_devtools and handles incoming messages to goTo a particular state
export function configureReduxDevTools() {
    if (typeof window === "object" && (window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__
        && (window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__.connect) {
        const options = {}
        devTools = (window as unknown as any).__REDUX_DEVTOOLS_EXTENSION__.connect(options)

        devTools.subscribe((message : any) => {
            if (message.payload && typeof message.payload.actionId === 'number')
            restoreState(message.payload.actionId * 1);
        });

        return devTools;
    }
}

// --- Send out the intial state using the devtools init call

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
    targets.clear();
    const actionEntry : actionEntry = {
        transaction: Object.assign(new Transaction(), Transaction.defaultTransaction),
        targets: new Map(Array.from(rootTargets).map(
            target => ([target, cloneProxyTarget(target)])))
    }
    actions[++lastAction] = actionEntry;
    firstAction = Math.max(firstAction, 0);
    if ((lastAction - firstAction) > maxAge)
        delete actions[firstAction++]
}

function  restoreState(id : number) {
    if (id >= firstAction) {
        const actionEntry = actions[id];
        actionEntry.targets.forEach( (newTarget, originalTarget) =>
            Object.assign(originalTarget.__proxy__, newTarget));
    }
}

// --- Utility to clone the state graph an object at a time in a recursive descent

const targets : Map<Target, Target> = new Map();

function cloneProxyTarget(target : any) : Target {

    let cloned = targets.get(target);
    if (cloned)
        return cloned;

    let clone;
    try {
        clone = new target.constructor();
    } catch(e) {
        console.log("");
    }
    targets.set(target, clone);

    for(let prop in target)
        clone[prop] = cloneProp(target[prop]);
    return clone;
}

function cloneProp(value : unknown) {
    let newValue : unknown;
    if (value instanceof Date)
        newValue = new Date(value.getTime());
    else if (value instanceof Array)
        newValue = value.map(value => cloneProp(value));
    else if (value instanceof Map) {
        newValue = new Map();
        (value as Map<any, any>).forEach(
            (prop : any , key : any) => (newValue as Map<any,any>).set(key, cloneProp(prop)));
    } else if (value instanceof Set) {
        newValue = new Set();
        (value as Set<any>).forEach(value => (newValue as Set<any>).add(value));
    } else if (typeof value === 'object' && value !== null)
        newValue = cloneProxyTarget((value as ProxyTarget).__target__ || value);
    else
        newValue = value;
    return newValue;
}

