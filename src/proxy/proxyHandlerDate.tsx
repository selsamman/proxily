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

        return (...args : any []) => {
            const oldVal = (target as unknown as Date).getTime();
            const val = (target as any)[prop].apply(target, args);
            const newVal = (target as unknown as Date).getTime()
            if (prop.match(/^set/)) {
                DataChanged(target, '*', true);
                if (target.__transaction__.timePositioning)
                    target.__transaction__.recordUndoRedo(()=>(target as unknown as Date).setTime(oldVal),()=>(target as unknown as Date).setTime(newVal))
            }
            return val;
        };
    }
}
