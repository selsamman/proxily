import EventEmitter from "events";
import {buffers, EventChannel, Saga, Task} from "redux-saga";
import {eventChannel, runSaga} from "@redux-saga/core";
import {takeEvery, cancel, take} from "@redux-saga/core/effects";

const sagaContainers : Map<any, Map<any, SagaContainer>> = new Map();
interface SagaContainer {
    task : Task,
    emitter: EventEmitter
    cancelEmitter: EventEmitter
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
        sagaContainer.cancelEmitter.emit('call', "cancel");
        sagaContainers.get(task)?.delete(taker || takeEvery);
        if(sagaContainers.get(task)?.size === 0)
            sagaContainers.delete(task);
    }
}

function getSagaContainer(task : any, taker : any, ...takerArgs : any) {
    const taskKey = task.__original__ || task;
    let sagaWorker = sagaContainers.get(taskKey);
    if (!sagaWorker) {
        sagaWorker = new Map();
        sagaContainers.set(taskKey, sagaWorker);
    }
    let sagaContainer = sagaWorker.get(taker);
    if (sagaContainer)
        return sagaContainer;
    const emitter = new EventEmitter();
    const cancelEmitter = new EventEmitter();
    const options = {
        channel : eventChannel((emit : any) => {
            cancelEmitter.on('call', emit);
            return () => {console.log("channel closed")}
            }, buffers.fixed(10))
    };
    sagaContainer = {
        emitter,
        cancelEmitter,
        task: runSaga(options, dispatcher as Saga, emitter, options.channel, taker, task, ...takerArgs),
    }
    sagaWorker.set(taker, sagaContainer);
    return sagaContainer;
}

function* dispatcher(emitter : EventEmitter, cancelChannel : EventChannel<any>, taker : any, worker : any, ...takerArgs : any) : any{
    const channel : EventChannel<any> = yield eventChannel<any>((emit : any) => {
            emitter.on('call', emit);
            return () => {console.log("channel closed")}
        }, buffers.fixed(10));
    const task = yield taker(...takerArgs, channel, worker);
    yield take(cancelChannel)
    yield cancel(task);
}

