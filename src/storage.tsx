import {serialize, deserialize} from "js-freeze-dry";
import {observe, observable} from "./proxyObserve";
export interface StorageEngine {
    getItem(key : string) : any
    setItem(key: string, value: any) : any
    removeItem(key: string) : void
}

export interface PersistConfig {
    key?: string,
    storageEngine?: StorageEngine,
    classes? : {[index: string] : any};
    serializers? : {[index: string] : (obj: any, type? : any)=>any};
    deserializers? : {[index: string] : (obj: any, type? : any)=>any};
    migrate?: (persistIn : any, initialIn : any) => any;
}

export function persist<T>(initialState: T, config : PersistConfig) : T {
    const key = config.key || 'root'
    const storageEngine : StorageEngine= config.storageEngine || localStorage;
    const persistedStateJSON = storageEngine.getItem(key);
    let persistedState : T;
    if (persistedStateJSON) {
        persistedState = deserialize(persistedStateJSON, config.classes, config.deserializers, 'persist');
        if (config.migrate)
            persistedState = config.migrate(persistedState, initialState);
        else
            persistedState = migrate(persistedState, initialState);
    } else
        persistedState = initialState;
    let scheduled = false;
    observe(persistedState, onChange, undefined, {batch : true, delay: 0, notifyParents : true});
    return observable(persistedState);
    function onChange() {
        if (!scheduled)
            setTimeout(() => {
                storageEngine.setItem(key, serialize(persistedState, config.classes, config.serializers, 'persist'))
                scheduled = false;
        }, 0);
    }
}
export async function  persistAsync <T>(initialState: T, config : PersistConfig) : Promise<T> {
    const key = config.key || 'root'
    const storageEngine : StorageEngine | undefined = config.storageEngine
    if (!storageEngine)
        throw( new Error("storageEngine parameter missing from persistAsync"));
    const persistedStateJSON = await storageEngine.getItem(key);
    let persistedState : T;
    if (persistedStateJSON) {
        persistedState = deserialize(persistedStateJSON, config.classes, config.serializers);
        if (config.migrate)
            persistedState = config.migrate(persistedState, initialState);
        else
            persistedState = migrate(persistedState, initialState);
    } else
        persistedState = initialState;
    let scheduled = false;
    observe(persistedState, onChange);
    return observable(persistedState);
    function onChange() {
        if (!scheduled)
            setTimeout(() => {
                storageEngine?.setItem(key, serialize(persistedState, config.classes, config.serializers))
                scheduled = false;
            }, 0);
    }
}

export function migrate (persistIn : any, initialIn : any) {
    const visited = new Set();
    const outState = Object.create(initialIn);
    return mergeState(outState, persistIn);
    function mergeState (initialIn : any, persistIn : any) {

        // Different types of objects take the initial state
        if (persistIn && initialIn &&  persistIn?.constructor !== initialIn?.constructor)
            return Object.create(initialIn);

        // Pick the one that is not undefined
        let outState = typeof persistIn !== 'undefined' ? persistIn :
            (typeof initialIn !== 'undefined' ? Object.create(initialIn) : undefined);

        if (outState instanceof Array || outState instanceof Map || outState instanceof Set ||
            outState instanceof Date || typeof outState === 'string' || typeof outState == 'number' ||
            outState === null || visited.has(outState) || !(persistIn && initialIn))
            return outState;
        else {
            visited.add(outState);
            for (const prop in persistIn)
                 mergeState(initialIn[prop], persistIn[prop]);
            return outState;
        }

    }
}
