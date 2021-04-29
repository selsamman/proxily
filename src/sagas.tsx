import EventEmitter from "events";
import {EventChannel, Saga} from "redux-saga";
import {eventChannel, runSaga} from "@redux-saga/core";
import {takeEvery, cancel} from "@redux-saga/core/effects";

const sagaContainers : Map<any, Map<any, SagaContainer>> = new Map();
interface SagaContainer {
    task : any,
    emitter: EventEmitter
}

/*
Invoke a saga using a standard redux-saga event helper (e.g. takeEvery, takeLast, debounce)

Will automatically start a main dispatching saga using a helper effect if not already started.  There will be
at most one main dispatching saga per worker/effect helper combination.

Schedule will then emit via a channel to the dispatching saga so it can be scheduled appropriately according
to the algorithm of the effect helper.  You may also pass in your own custom effect helper.  One parameter
may be passed and the types will be inferred and verified from your task saga
 */
export function scheduleTask<T> (task : (parameter: T)=>void, parameter : T, taker?: any, ...takerArgs : any) : void {
    const sagaContainer = getSagaContainer(task,  taker || takeEvery, ...takerArgs);
    sagaContainer.emitter.emit('call', parameter as any);
}
export function cancelTask (task : any, taker?: any) : void {
    const sagaContainer = getSagaContainer(task,taker || takeEvery);
    if (sagaContainer) {
        cancel(sagaContainer.task);
        sagaContainers.get(task)?.delete(taker || takeEvery);
        if(sagaContainers.get(task)?.size === 0)
            sagaContainers.delete(task);
    }
}
function getSagaContainer(task : any, taker : any, ...takerArgs : any) {
    let sagaWorker = sagaContainers.get(task);
    if (!sagaWorker) {
        sagaWorker = new Map();
        sagaContainers.set(task, sagaWorker);
    }
    let sagaContainer = sagaWorker.get(taker);
    if (sagaContainer)
        return sagaContainer;
    const emitter = new EventEmitter();
    sagaContainer = {
        emitter,
        task: runSaga({}, dispatcher as Saga, emitter, taker, task, ...takerArgs)
    }
    sagaWorker.set(taker, sagaContainer);
    return sagaContainer;
}

function* dispatcher(emitter : EventEmitter, taker : any, worker : any, ...takerArgs : any) {
    const channel : EventChannel<any> = yield eventChannel<any>((emit : any) => {
        emitter.on('call', emit);
        return () => {console.log("channel closed")}
    });
    yield taker(...takerArgs, channel, worker);
}

