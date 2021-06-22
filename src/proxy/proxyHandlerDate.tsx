
import {log, logLevel} from "../log";
import {isInternalProperty, Target} from "../proxyObserve";
import {DataChanged} from "./proxyCommon";


export const proxyHandlerDate = {

    get(target : Target, prop: any) : any {

        // Only way to get a reference to the object being proxied
        if (prop === '__target__')
            return target;
        if (isInternalProperty(prop))
            return Reflect.get(target, prop, target);

        const targetValue = Reflect.get(target, prop, target);
        if (typeof targetValue !== "function")
            return targetValue;

        if(logLevel.propertyReference) log(`${target.constructor.name}.${prop} referenced`);

        if (prop.match(/^set/)) {
            DataChanged(target, prop);
        }
        return targetValue.bind(target);
    }
}
