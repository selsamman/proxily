
import {log, logLevel} from "./log";
import {ProxyWrapper, Target} from "./ProxyWrapper";
import {DataChanged} from "./proxyCommon";


export const proxyHandlerDate = {

    get(target : Target, prop: any, proxy: ProxyWrapper) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        if (prop.match(/^set/)) {
            DataChanged(proxy, prop, proxy);
        }
        return targetValue.bind(target);
    }
}
