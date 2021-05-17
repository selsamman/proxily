
import {log, logLevel} from "../log";
import {proxies, ProxyWrapper, Target} from "../ProxyWrapper";
import {DataChanged} from "./proxyCommon";


export const proxyHandlerDate = {

    get(target : Target, prop: any, receiver: ProxyWrapper) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        const proxyWrapper = proxies.get(target);
        if (!proxyWrapper)
            return Reflect.get(target, prop, receiver);

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
