import "@testing-library/jest-dom/extend-expect";
import {serialize} from "../src";
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

});
