import { runSaga, eventChannel, stdChannel } from "@redux-saga/core";
import {
    delay,
    call,
    takeEvery,
    takeLeading,
    debounce,
    cancelled,
    take,
    fork,
    put
} from "@redux-saga/core/effects";
/*
const takeLeading = (patternOrChannel:any, saga:any, ...args:any) => fork(function*() {
    while (true) {
        const action : any = yield take(patternOrChannel);
        yield call(saga, ...args.concat(action));
        console.log("foo");
    }
})
*/
import {proxy} from "../src";
// @ts-ignore
import EventEmitter from "events";
import type { EventChannel } from 'redux-saga';
import type { Saga } from 'redux-saga';
import {scheduleTask, cancelTask} from "../src/sagas";

describe("scheduling with redux-saga", () => {
    it("can start a saga via channel", async () => {
        let resolver : any;
        const createSagaIO = (emitter : any) => {
            const channel = stdChannel();
            emitter.on("action", channel.put);

            return {
                channel,
                dispatch: (output : any) => {
                    emitter.emit("action", output);
                },
                getState: () => {
                    "sampleValue";
                }
            };
        };

        function createChannel() {
            return eventChannel<any>(emit => {
                let counter = 0;
                const id = setInterval(() => {
                    emit(counter++);
                }, 1000);

                return () => clearInterval(id);
            });
        }

        function* putReceipt() {
            yield delay(500);
            yield put({ type: "RECEIPT" });
        }

        function* someSaga() {
            const chan : EventChannel<any> = yield call(createChannel);
            try {
                let dec = 4;
                while (dec--) {
                    yield take(chan as any) ;

                    yield fork(putReceipt);

                    const response : unknown = yield take("*") as unknown;
                    if (response) {
                        console.log("look im here!", response);
                    }
                }
                resolver();
            } finally {
                if ((yield cancelled()) as boolean) {
                    chan.close();
                }
            }
        }
    console.log("Start");
        const emitter = new EventEmitter();
        await new Promise((resolve) => {
            runSaga(createSagaIO(emitter), someSaga as Saga);
            resolver = resolve;
        });
    console.log("End");
    });
    it("can start a saga and feed it", async () => {
        let resolver : any;
        let count = 0;
        const emitter = new EventEmitter();

        function* worker(interval : number) {
            console.log("delaying " + interval);
            yield delay(interval);
            ++count;
            if (count > 1)
                resolver();
        }

        function* dispatcher(emitter : EventEmitter, effect : any, worker : any) {
            const channel : EventChannel<any> = yield eventChannel<any>((emit : any) => {
                emitter.on('call', emit);
                return () => {console.log("channel closed")}
            });
            yield effect(channel, worker);
        }
        runSaga({}, dispatcher as Saga, emitter, takeEvery, worker);
        emitter.emit('call', 1000);
        emitter.emit('call', 1000);
        await new Promise((resolve) => {resolver = resolve});
    });
    it("can start a saga and feed it with API", async () => {
        let resolver : any;
        let count = 0;

        function* worker(interval : number) {
            console.log("delaying " + interval);
            yield delay(interval);
            ++count;
            if (count > 1)
                resolver();
        }

        console.log("Start");
        const delay = (time : number) => new Promise((res : any) =>setTimeout(()=>res(), time));
        scheduleTask(worker,1000, debounce, 500);
        await delay(600);
        scheduleTask(worker,1000, debounce, 500);
        await new Promise((resolve) => {resolver = resolve});
        console.log("End");
    });
    it("can do it with class", async () => {
        let resolver : any;
        let count = 0;

        class Container {
            *task({interval} : {interval : number}) {
                yield delay(interval);
                ++count;
                if (count > 1)
                    resolver();
            }
            invokeWorker () {
                scheduleTask(this.task,{interval: 1000});
            }
        }
        const container = proxy(new Container());
        container.invokeWorker();
        container.invokeWorker();
        await new Promise((resolve) => {resolver = resolve});

    });
    it("can cancel with class", async () => {
        let resolver : any;

        class Container {
            *task({interval} : {interval : number}) {
                yield delay(interval);
                ++this.count;
                if (this.count > 1)
                    resolver();
            }
            doTask () {
                scheduleTask(this.task,{interval: 1000}, takeLeading);
            }
            cancelTask() {
                cancelTask(this.task, takeLeading);
            }
            count = 0;
        }
        const container = proxy(new Container());
        const start = (new Date().getTime());
        container.doTask();
        container.doTask();
        await new Promise((resolve) => {resolver = resolve});
        const elapsed = (new Date().getTime()) - start;
        setInterval(() => container.cancelTask(), 800);
        expect (elapsed >= 800).toBe(true)


    });
});
