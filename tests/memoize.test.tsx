import {memoize, makeObservable} from "../src";


describe("data structure tests of proxy", () => {
    let calls = 0;
    class Root {
        _value = 0;

        @memoize()
        getValue () {
            ++ calls;
            return this._value;
        }

        @memoize()
        get value() {
            ++ calls;
            return this._value;
        }

        @memoize()
        getValuePlus(a : number, b: number) {
            ++calls;
            return this._value + a + b;
        }
    }
    it ( "memo a normal function", () => {
        calls = 0;
        const root = makeObservable(new Root());
        expect(root.getValue()).toBe(0);
        expect(root.getValue()).toBe(0);
        expect(calls).toBe(1);
        root._value++;
        expect(root.getValue()).toBe(1);
        expect(root.getValue()).toBe(1);
        expect(calls).toBe(2);

    });
    it ( "memo a getter function", () => {
        calls = 0;
        const root = makeObservable(new Root());
        expect(root.value).toBe(0);
        expect(root.value).toBe(0);
        expect(calls).toBe(1);
        root._value++;
        expect(root.value).toBe(1);
        expect(root.value).toBe(1);
        expect(calls).toBe(2);

    });
    it ( "memo a function with parameters", () => {
        calls = 0;
        const root = makeObservable(new Root());
        expect(root.getValuePlus(0, 0)).toBe(0);
        expect(root.getValuePlus(0, 0)).toBe(0);
        expect(root.getValuePlus(0, 1)).toBe(1);
        expect(root.getValuePlus(0, 1)).toBe(1);
        expect(calls).toBe(2);
        root._value++;
        expect(root.getValuePlus(0, 1)).toBe(2);
        expect(root.getValuePlus(1, 1)).toBe(3);
        expect(root.getValuePlus(1, 1)).toBe(3);
        expect(calls).toBe(4);

    });
});
