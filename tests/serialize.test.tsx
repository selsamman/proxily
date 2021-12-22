import "@testing-library/jest-dom/extend-expect";
import {memoize, serialize} from "../src";
import {deserialize} from "../src";

let id = 1;
function generateUUID() {
    return id++;
}

describe("serialization tests", () => {
    it("Can serialize Michel Westrate's test case 1", () => {
        class Box {
            uuid = generateUUID();
            x = 0;
            y = 0;
            @memoize()
            get coordinate () {
                return `${this.x}:${this.y}`;
            }
            constructor(x : number, y : number) {
                this.x = x;
                this.y = y;
            }
        }

        class Arrow {
            uuid = generateUUID();
            from;
            to;
            constructor(from : Box, to : Box) {
                this.from = from;
                this.to = to;
            }
        }

        class Drawing {
            name = "My Drawing";
            boxes : Array<Box> = [];
            arrows : Array<Arrow> = [];
        }

        const drawing = new Drawing()
        const box1 = new Box(20, 40)
        const box2 = new Box(70, 70)
        const arrow1 = new Arrow(box1, box2)
        drawing.boxes.push(box1, box2)
        drawing.arrows.push(arrow1);
        const json = serialize(drawing);
        const newDrawing = deserialize(json, [Box, Arrow, Drawing]);
        expect(newDrawing instanceof Drawing).toBe(true);
        expect(newDrawing.boxes[0] instanceof Box).toBe(true);
        expect(newDrawing.boxes[0] instanceof Box).toBe(true);
        expect(newDrawing.arrows[0] instanceof Arrow).toBe(true);
        //expect(newDrawing.boxes[0].uuid).toBe(drawing.boxes[0].uuid);
        expect(newDrawing.arrows[0].from).toBe(newDrawing.boxes[0]);
        expect(newDrawing.arrows[0].to).toBe(newDrawing.boxes[1]);
        expect(newDrawing.boxes[0].coordinate).toBe('20:40');
    })
    it("Can serialize ES 6 Sets", () => {
        class Container {
            constructor(data: Array<any>) {
                this.data = new Set(data || []);
            }
            data = new Set();
        }

        class Data1 {
            uuid = generateUUID();
            constructor(value : any) {
                this.value = value;
            }
            value : any
        }
        class Data2 {
            uuid = generateUUID();
            constructor(value : any) {
                this.value = value;
            }
            value : any
        }
        const c = new Container([new Data1(33), new Data2(35)]);
        c.data.add(c);
        const json = serialize(c);
        const newC = deserialize(json, [Container, Data1, Data2]);
        expect(newC instanceof Container).toBe(true);
        const arr = Array.from(newC.data);
        expect(arr[0] instanceof Data1).toBe(true);
        expect((arr[0] as Data1).value).toBe(33);
        expect(arr[1] instanceof Data2).toBe(true);
        expect((arr[1] as Data1).value).toBe(35);
        expect(arr[2]).toBe(newC);
    });
    it("Can serialize ES 6 Maps", () => {
        class Container {
            constructor(data: Array<[key: any, data: any]>) {
                this.data = new Map(data || []);
            }
            data = new Map();
        }

        class Data1 {
            uuid = generateUUID();
            constructor(value : any) {
                this.value = value;
            }
            value : any
        }
        class Data2 {
            uuid = generateUUID();
            constructor(value : any) {
                this.value = value;
            }
            value : any
        }
        const c = new Container([['A', new Data1(33)], ['B', new Data2(35)]]);
        c.data.set('C', c);
        const json = serialize(c);
        const newC = deserialize(json, [Container, Data1, Data2]);
        expect(newC instanceof Container).toBe(true);
        expect(newC.data.get('A') instanceof Data1).toBe(true);
        expect(newC.data.get('A').value).toBe(33);
        expect(newC.data.get('B') instanceof Data2).toBe(true);
        expect(newC.data.get('B').value).toBe(35);
        expect(newC.data.get('C')).toBe(newC);
    });
    it("Can serialize Dates", () => {
        class Container {
            constructor() {
                this.date = new Date();
            }
            date : Date;
        }

        const c = new Container();
        const json = serialize(c);
        const newC = deserialize(json, [Container]);
        expect(newC instanceof Container).toBe(true);
        expect(newC.date instanceof Date).toBe(true);
        expect(newC.date.getTime()).toBe(c.date.getTime());
    });
    it("Can serialize Strings", () => {
        class Container {
            str = "1";
            num = 1;
        }

        const c = new Container();
        const json = serialize(c);
        const newC = deserialize(json, [Container]);
        expect(newC.str).toBe("1");
        expect(newC.num).toBe(1);
        expect(typeof newC.str).toBe("string");
        expect(typeof newC.num).toBe("number");
    });

    it("Can serialize POJOs", () => {
        const c = {
            str: "1",
            num:1
        }

        const json = serialize(c);
        const newC = deserialize(json, );
        expect(newC.str).toBe("1");
        expect(newC.num).toBe(1);
        expect(typeof newC.str).toBe("string");
        expect(typeof newC.num).toBe("number");
    });

    it("Can serialize mixed arrays", () => {
        const c = {
            arr: [ [1,2], {1:1, 2:2}, [1, null]],
            num:1,
            nil: null,
        }

        const json = serialize(c);
        const newC = deserialize(json, );
        expect(newC.arr.length).toBe(3);
        expect(newC.arr[0] instanceof Array).toBe(true);
        expect(newC.arr[0][1]).toBe(2);
        expect(typeof newC.arr[1]).toBe("object");
        expect(newC.arr[1][2]).toBe(2);
        expect(newC.arr[2][1]).toEqual(null);
        expect(newC.num).toBe(1);
        expect(typeof newC.num).toBe("number");
        expect(newC.nil).toEqual(null);
    });


    it ("Can serialized mixed Maps", () => {
        // @ts-ignore
        const c = {map: new Map([[1, 1], [2, null], [3, undefined], [4, [1,2]]])}
        const json = serialize(c);
        const newC = deserialize(json, );
        expect(newC.map.get(1)).toEqual(1);
        expect(newC.map.get(2)).toEqual(null);
        expect(newC.map.get(3)).toEqual(null); // because JSON.stringify does this
        expect(newC.map.get(4)[0]).toEqual(1);
        expect(newC.map.get(4)[1]).toEqual(2);
    })


    it ("Can serialized mixed Sets", () => {
        const c = {set: new Set([1, null, undefined, [1,2]])}
        const json = serialize(c);
        const newC = deserialize(json, );
        expect(newC.set.has(1)).toBe(true);
        expect(newC.set.has(null)).toBe(true);
        expect(newC.set.has(undefined)).toBe(false); // because JSON.stringify does this
        expect(Array.from(newC.set).findIndex((e : any) => e instanceof Array && e[1] === 2)).toBeGreaterThan(-1);
    })



    it("Can serialize with helpers", () => {
        class Box {
            uuid = generateUUID();
            x = 0;
            y = 0;
            constructor(x : number, y : number) {
                this.x = x;
                this.y = y;
            }
        }
        const json = serialize(new Box(1, 1));
        const box = deserialize(json, [], {Box: makeBox});
        expect(box.x).toBe(2);
        expect(box.y).toBe(2);
        function makeBox(values : Box) {
            return new Box(values.x + 1, values.y + 1);
        }
    });

});
