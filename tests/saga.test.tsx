import { runSaga, eventChannel, stdChannel } from "@redux-saga/core";
import {
    delay,
    call,
    takeEvery,
    takeLeading,
    takeLatest,
    debounce,
    cancelled,
    take,
    fork,
    put
} from "@redux-saga/core/effects";

import {makeObservable} from "../src";
// @ts-ignore
import EventEmitter from "events";
import type { EventChannel } from 'redux-saga';
import type { Saga } from 'redux-saga';
import {scheduleTask, cancelTask} from "../src/sagas";

const wait = (time : number) => new Promise((res : any) =>setTimeout(()=>res(), time));

describe("schedule with redux-saga", () => {
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
                }, 150);

                return () => clearInterval(id);
            });
        }

        function* putReceipt() {
            yield delay(200);
            yield put({ type: "RECEIPT" });
        }

        function* someSaga() {
            const chan : EventChannel<any> = yield call(createChannel);
            try {
                let dec = 4;
                while (dec--) {
                    yield take(chan as any) ;

                    yield fork(putReceipt);

                    yield take("*") as unknown;
                }
                resolver();
            } finally {
                if ((yield cancelled()) as boolean) {
                    chan.close();
                }
            }
        }
        const emitter = new EventEmitter();
        await new Promise((resolve) => {
            runSaga(createSagaIO(emitter), someSaga as Saga);
            resolver = resolve;
        })
    });
    it("can start a saga and feed it", async () => {
        let resolver : any;
        let count = 0;
        const emitter = new EventEmitter();

        function* worker(interval : number) {
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
        emitter.emit('call', 150);
        emitter.emit('call', 150);
        await new Promise((resolve) => {resolver = resolve});
    });
});
describe("It can schedule with Proxily Sagas", () => {

    it("debounce", async () => {
        let trace = "";
        let elapsed = 0
        const first = new Date().getTime();

        function *worker({interval, type} : {interval : number, type : string}) {
                yield delay(interval);
                trace += type;
                elapsed = new Date().getTime() - first
            }
        scheduleTask(worker,{interval: 50, type: 'A'}, debounce, 50);
        await wait(10);
        scheduleTask(worker,{interval: 50, type: 'A'}, debounce, 50);
        await wait(10);
        scheduleTask(worker,{interval: 50, type: 'A'}, debounce, 50);
        await wait(450)
        expect(trace).toBe("A");
        console.log(elapsed);
        expect(elapsed > 0 && elapsed < 200).toBe(true);
    });

    it("takeEvery", async () => {
        let trace = "";
        let elapsed = 0
        const first = new Date().getTime();

        function *worker({interval, type} : {interval : number, type : string}) {
            yield delay(interval);
            trace += type;
            elapsed = new Date().getTime() - first
        }
        scheduleTask(worker,{interval: 150, type: 'A'}, takeEvery);
        scheduleTask(worker,{interval: 150, type: 'B'}, takeEvery);
        scheduleTask(worker,{interval: 150, type: 'C'}, takeEvery);
        await wait(200)
        expect(trace).toBe("ABC");
        console.log(elapsed);
        expect(elapsed > 0 && elapsed < 200).toBe(true);
    });
    it("takeLeading", async () => {
        let trace = "";
        let elapsed = 0
        const first = new Date().getTime();

        function *worker({interval, type} : {interval : number, type : string}) {
            yield delay(interval);
            trace += type;
            elapsed = new Date().getTime() - first
        }
        scheduleTask(worker,{interval: 150, type: 'A'}, takeLeading);
        scheduleTask(worker,{interval: 150, type: 'B'}, takeLeading);  // ignored
        scheduleTask(worker,{interval: 150, type: 'C'}, takeLeading);  // ignored
        await wait(200)
        expect(trace).toBe("A");
        console.log(elapsed);
        expect(elapsed > 0 && elapsed < 200).toBe(true);
    });
    it("takeLatest", async () => {
        let trace = "";
        let elapsed = 0
        const first = new Date().getTime();

        function *worker({interval, type} : {interval : number, type : string}) {
            yield delay(interval);
            trace += type;
            elapsed = new Date().getTime() - first
        }
        scheduleTask(worker,{interval: 150, type: 'A'}, takeLatest);
        scheduleTask(worker,{interval: 150, type: 'B'}, takeLatest);  // ignored
        scheduleTask(worker,{interval: 150, type: 'C'}, takeLatest);  // ignored
        await wait(200)
        expect(trace).toBe("C");
        console.log(elapsed);
        expect(elapsed > 0 && elapsed < 200).toBe(true);
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
                scheduleTask(this.task,{interval: 150});
            }
        }
        const container = makeObservable(new Container());
        container.invokeWorker();
        container.invokeWorker();
        await new Promise((resolve) => {resolver = resolve});

    });
    it("can cancel with takeLeading", async () => {
        let trace = "";
        let elapsed = 0
        const first = new Date().getTime();

        class Container {
            *task({interval, type} : {interval : number, type : string}) {
                yield delay(interval);
                trace += type;
                elapsed = new Date().getTime() - first
            }
            doTask (t : string) {
                scheduleTask(this.task,{interval: 50, type: t}, takeLeading);
            }
            cancelTask() {
                cancelTask(this.task, takeLeading);
            }
            count = 0;
        }
        const container = makeObservable(new Container());
        container.doTask('a');
        container.doTask('b');
        setTimeout(() => container.cancelTask(), 75);
        await wait(200);
        expect(trace).toBe("a");
        expect(elapsed > 0 && elapsed < 75).toBe(true);

    });
    it("can cancel with class and custom taker", async () => {

        let trace = "";
        let elapsed = 0
        const first = new Date().getTime();

        const takeLeadingCustom = (patternOrChannel:any, saga:any, ...args:any) => fork(function*() {
            while (true) {
                const action : any = yield take(patternOrChannel);
                yield call(saga, ...args.concat(action));
            }
        })
        class Container {
            *task({interval, type} : {interval : number, type : string}) {
                yield delay(interval);
                trace += type;
                elapsed = new Date().getTime() - first
            }
            doTask (t : string) {
                scheduleTask(this.task,{interval: 50, type: t}, takeLeadingCustom);
            }
            cancelTask() {
                cancelTask(this.task, takeLeadingCustom);
            }
            count = 0;
        }
        const container = makeObservable(new Container());
        container.doTask('a');
        container.doTask('b');
        setTimeout(() => container.cancelTask(), 75);
        await wait(200);
        expect(trace).toBe("a");
        expect(elapsed > 0 && elapsed < 75).toBe(true);
    });
});
