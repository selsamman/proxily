export interface LogLevels {
    propertyReference: boolean
    propertyChange : boolean
    useProxy: boolean;
    render: boolean;
}

export let logLevel : Partial<LogLevels> = {}

export let log = (data : string) : void => {
    console.log(data);
}
export function setLog(logFN : (data : string) => void) {
    log = logFN;
}
export function setLogLevel(levels : Partial<LogLevels>) {
    logLevel = levels;
}
