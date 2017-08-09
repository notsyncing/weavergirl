import {EventHandlerInfo} from "./wire-info";

export function EventHandler(event: string, selectors: string | Array<string>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        if (typeof target[propertyKey] !== "function") {
            console.error(`${EventHandler.name} (event ${event}, selectors ${selectors}) is not decorated to a ` +
                `method: ${propertyKey} on ${target}`);
            return;
        }

        if (!target["_weavergirlEventWires"]) {
            target["_weavergirlEventWires"] = new Map<string, EventHandlerInfo>();
        }

        let wires = target["_weavergirlEventWires"];

        if (!wires.has(propertyKey)) {
            wires.set(propertyKey, {
                type: null,
                targetSelectors: []
            });
        }

        let info = wires.get(propertyKey);
        info.type = event;

        if (selectors instanceof Array) {
            for (let s of selectors) {
                info.targetSelectors.push(s);
            }
        } else {
            info.targetSelectors.push(selectors);
        }

        console.info(`Event handler for ${event} on selectors ${selectors} -> ${target.constructor.name}.${propertyKey}`);
    }
}

export function OnClick(selectors: string | Array<string>) {
    return EventHandler("click", selectors);
}

export function OnInput(selectors: string | Array<string>) {
    return EventHandler("input", selectors);
}
