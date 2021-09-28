export interface LogLevels {
    propertyChange : boolean
    render: boolean;
    propertyTracking : boolean;
    transitions: boolean
}

export let logLevel : Partial<LogLevels> = {}

export let log = console.log;

export function logChange (target : any, prop : any, key: any, value : any) {
    let objName = "";
    let propName = "";
    let keyName = "";
    let valueName = "value";
    if (target && target.constructor)
        objName = target.constructor.name;
    if (prop)
        propName = prop
    if (key) {
        if (typeof key === "string" || typeof key === "number")
            keyName = key === "*" ? "" : "[" + key + "]";
        else
            keyName = "[object]"
    }
    if (typeof value === "string" || typeof value === "number")
        valueName = " = " + value;
    else
        valueName = " modified";
    log(currentFunctionName + [objName, propName + keyName].join(".") + valueName);
}

let currentFunctionName = "";
export function setCurrentFunction (target? : any, prop? : any) {
    let objName = "";
    if (target && target.constructor)
        objName = target.constructor.name;
    if (!prop)
        currentFunctionName = "";
    else
        currentFunctionName = [objName, prop].join(".") + ": ";
}

export function setLog(logFN : (data : string) => void) {
    log = logFN;
}

export function resetLogging() {
    log = console.log;
    logLevel = {};
}

export function setLogLevel(levels : Partial<LogLevels>) {
    logLevel = levels;
}
