import {observable, suspendable} from "../src";
import {waitFor} from "@testing-library/react";
const wait = (time : number) => new Promise((res : any) =>setTimeout(()=>res(), time));
describe("suspense", () => {

    class Root {

        @suspendable()
        get goodResult () {
            return wait(500)
                .then( () => {
                    return  "good";
                });
        }
        @suspendable()
        get badResult () {
            return wait(500)
                .then( () => {
                    throw  "bad";
                });
        }
    }

    it ( "throws a promise", () => {
        const root = observable(new Root());
        let thrown = false;
        try {
            root.goodResult
        } catch (e) {
            thrown = true
        };
        expect(thrown).toBe(true);
    });
    it ( "promise resolves", async () => {
        const root = observable(new Root());
        let done = false;
        try {
            root.goodResult
        } catch (promise : any) {
            promise.then( () => {
                expect(root.goodResult).toBe("good");
                done = true;
            });
        };
        await waitFor(() => expect(done).toBe(true));
    })
    it ( "promise resolves to error", async () => {
        const root = observable(new Root());
        let done = false;
        try {
            root.badResult
        } catch (promise : any) {
            promise.then( () => {
                expect(() => root.badResult).toThrow("bad");
                done = true;
            });
        };
        await waitFor(() => expect(done).toBe(true));
    })

})
