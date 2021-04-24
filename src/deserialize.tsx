interface ObjectMarker {
    c: string,
    i: number
    v: any
}
type ClassHandlers = {[index: string] : (obj: any)=>any};


export function deserialize(json : string, classes : Array<any>, classHandlers? : ClassHandlers) {
    const classHelpers : {[index: string] : (obj: any)=>any} = {};
    Object.assign(classHelpers, classHandlers || {});

    const classMap : {[index: string] : any} = {}
    classes.map(c => classMap[c.prototype.constructor.name] = c);

    const objects : Map<number, any> = new Map();
    const obj = JSON.parse(json);
    return processObjectMarker(obj);

    function processObjectMarker(obj : ObjectMarker) {
        if (!obj.c)
            throw ("missing c property on ObjectMarker");
        if (!(obj.i || obj.v))
            throw ("missing i or v property on ObjectMarker");
        if (obj.v) {
            switch(obj.c) {
                case 'Object':
                    objects.set(obj.i, obj.v);
                    return processObject(obj.v);
                case 'Map':
                    const map  = new Map(obj.v);
                    objects.set(obj.i, map);
                    map.forEach((value, key) => {
                        if(typeof value === 'object')
                            map.set(key, processObjectMarker(value as ObjectMarker));
                    });
                    return map;
                case 'Set':
                    const values = obj.v.map( (value : any) => (typeof value === 'object') ? processObjectMarker(value) : value);
                    const set  = new Set(values);
                    objects.set(obj.i, set);
                    return set;
                case 'Date':
                    const newDate = new Date(obj.v);
                    return newDate;
                default:
                    const newClass = classMap[obj.c];
                    const newHelper = classHelpers[obj.c];
                    if (newClass) {
                        const newObj1 = new newClass();
                        Object.assign( newObj1, obj.v);
                        objects.set(obj.i, newObj1);
                        return processObject(newObj1);
                    } else if (newHelper) {
                        const newObj2 = newHelper(obj.v);

                        objects.set(obj.i, newObj2);
                        return processObject(newObj2);
                    } else
                        throw (`Deserialize: Cannot find class ${obj.c}. It must be passed to deserialize`);
            }
        } else {
            const newObj2 = objects.get(obj.i);
            if (!newObj2)
                throw (`Deserialize: Cannot find object ${obj.c} ${obj.i}`);
            return newObj2;
        }
    }
    function processObject (obj : any) {
        for (const prop in obj) {
            if (obj[prop] instanceof Array)
                obj[prop] = obj[prop].map((element : any) => {
                    if (typeof element === "object")
                        return processObjectMarker(element)
                    else
                        return element;
                });
            else if (typeof obj[prop] === "object")
                obj[prop] = processObjectMarker(obj[prop]);
        }
        return obj;
    }
}