import Stage from "../router/stage";

// Polyfill from https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype["matchesSelector"] ||
        Element.prototype["mozMatchesSelector"] ||
        Element.prototype.msMatchesSelector ||
        Element.prototype["oMatchesSelector"] ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

export class WireBot {
    static doWirings(stage: Stage, element: Element): void {
        console.info(`Wiring events for ${element.id || element.tagName}, stage ${stage.constructor.name}`);

        let wires = stage["_weavergirlEventWires"];

        if (!wires) {
            return;
        }

        for (let key of wires.keys()) {
            let info = wires.get(key);

            let match = false;

            for (let selector of info.targetSelectors) {
                if (element.matches(selector)) {
                    match = true;
                    break;
                }
            }

            if (!match) {
                continue;
            }

            element.addEventListener(info.type, stage[key].bind(stage), false);
        }
    }
}