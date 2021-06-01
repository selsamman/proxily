
import {log, logLevel} from "../log";
import {proxies, Target} from "../ProxyWrapper";
import {DataChanged, proxyMissing} from "./proxyCommon";


export const proxyHandlerDate = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;

        const proxyWrapper = proxies.get(target) || proxyMissing(target, prop);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        if (prop.match(/^set/)) {
            DataChanged(proxyWrapper, prop, proxyWrapper);
        }
        return targetValue.bind(target);
    }
}
