import {observable, observe} from "../src";
import {scheduleTask} from "../src/sagas";
import {delay} from "@redux-saga/core/effects";

describe("batching testing for observer", () => {

    class Root {
        value = 0;

        increment () {
            ++this.value;
        }
        action () {
            this.increment();
            this.increment();
        }
        async asyncAction  () {
            this.action();
            await wait(50);
            this.action();
        }
        scheduleAction () {
            scheduleTask(this.task);
        }

        *task () {
            this.action();
            yield delay(0);
            this.action();
        }
    }
    const wait = (time : number) => new Promise((res : any) =>setTimeout(()=>res(), time));
    it ( "not batch actions", () => {
        let calls = 0;
        const root = observable(new Root());
        observe(root, () => ++calls, (r) => r.value, {batch: false});
        root.action();
        expect(calls).toBe(2);
        expect(root.value).toBe(2);
    });
    it ( "batch actions", () => {
        let calls = 0;
        const root = observable(new Root());
        observe(root, () => ++calls, (r) => r.value, {batch: true});
        root.action();
        expect(calls).toBe(1);
        expect(root.value).toBe(2);
    });
    it ( "batch actions on next tick", async () => {
        let calls = 0;
        const root = observable(new Root());
        observe(root, () => ++calls, (r) => r.value, {batch: true, delay: 0});
        root.action();
        root.action();
        expect(calls).toBe(0);
        expect(root.value).toBe(4);
        await wait(1);
        expect(calls).toBe(1);
    });
    it ( "batch async actions with await", async () => {
        let calls = 0;
        const root = observable(new Root());
        observe(root, () => ++calls, (r) => r.value, {batch: true, delay: 0});
        root.asyncAction();
        expect(calls).toBe(0);
        await wait(0);
        expect(calls).toBe(1);
        expect(root.value).toBe(2);
        await wait(100);
        expect(calls).toBe(2);
        expect(root.value).toBe(4);
    });
    it ( "batch async actions with generataors", async () => {
        let calls = 0;
        const root = observable(new Root());
        observe(root, () => ++calls, (r) => r.value, {batch: true, delay: 0});
        root.scheduleAction();
        expect(calls).toBe(0);
        await wait(10);
        expect(calls).toBe(1);
        expect(root.value).toBe(4);
    });

});
