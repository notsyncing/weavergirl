import Component from "../component/component";
import {Mutator} from "../component/mutator";
import MutatorHub from "../component/mutator-hub";

export default class Stage {
    mutatorHub = new MutatorHub(this);

    public state: any = null;

    constructor(public rootComponent: Component) {
        let __this = this;

        let watcher = {
            set: function (target, key, value) {
                console.dir(target);
                console.info(`Stage ${__this.constructor.name} state change detected: on ${target} key ${key} value ${value}`);

                let expr = Stage.getFullExpression(target, key);
                __this.rootComponent.updateMutator(expr, key, value);
            }
        };

        this.state = Stage.newWatchedObject(watcher);

        setTimeout(() => {
            this.stageWillEnter();
        }, 0);
    }

    handleMutatorNode(node: Node, tempStack: Array<Mutator>, handler: (mutator: Mutator) => void): void {
        if (node.nodeType === Node.COMMENT_NODE) {
            let s = node.textContent;

            if (s.startsWith(MutatorHub.mutatorBeginPattern)) {
                s = s.substring(MutatorHub.mutatorBeginPattern.length);
                let mutatorInfo = JSON.parse(s);

                tempStack.push({
                    stage: this,
                    info: mutatorInfo,
                    parent: node.parentNode,
                    beginPatternNode: node,
                    beginIndex: Array.prototype.indexOf.call(node.parentNode.childNodes, node),
                    endPatternNode: null,
                    endIndex: -1,
                    childNodes: null
                });
            } else if (s === MutatorHub.mutatorEndPattern) {
                let mutator = tempStack.pop();

                if (!mutator) {
                    console.dir(node);
                    throw new Error(`Unpaired mutator end pattern found at ${node}`);
                }

                mutator.endPatternNode = node;
                mutator.endIndex = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
                mutator.childNodes = [];

                for (let i = mutator.beginIndex + 1; i < mutator.endIndex; i++) {
                    mutator.childNodes.push(mutator.parent.childNodes[i]);
                }

                handler(mutator);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (let i = 0; i < node.attributes.length; i++) {
                let a = node.attributes[i];

                if (a.name.startsWith("weavergirl-mutator-")) {
                    let mutatorInfo = JSON.parse(decodeURIComponent(a.value));

                    let mutator: Mutator = {
                        stage: this,
                        info: mutatorInfo,
                        parent: node,
                        beginPatternNode: null,
                        beginIndex: -1,
                        endPatternNode: null,
                        endIndex: -1,
                        childNodes: null
                    };

                    handler(mutator);
                }
            }
        }
    }

    static getFullExpression(proxy: any, key: any, previousString = ""): string {
        let s = previousString;

        if (proxy.proxyFieldName) {
            let f = proxy.proxyFieldName;

            if (!isNaN(f)) {
                f = `[${f}]`;
            }

            s = f + s;

            if (key) {
                if ((proxy instanceof Array) && (!isNaN(key))) {
                    s += "["
                } else {
                    s += ".";
                }
            }
        }

        if (key) {
            s += key;

            if ((proxy instanceof Array) && (!isNaN(key))) {
                s += "]";
            }
        }

        if (proxy.parentProxy) {
            if (proxy.parentProxy.proxyFieldName) {
                if ((proxy.proxyFieldName) && (isNaN(proxy.proxyFieldName))) {
                    s = "." + s;
                }
            }

            return Stage.getFullExpression(proxy.parentProxy, null, s);
        }

        return s;
    }

    static newWatchedObject(handlers): any {
        let watcher = {
            get: function (target, key) {
                if ((typeof target[key] === "object") && (target[key] !== null)) {
                    let p = new Proxy(target[key], watcher) as any;
                    p.parentProxy = target;
                    p.proxyFieldName = key;

                    return p;
                } else {
                    if (handlers.get) {
                        handlers.get(target, key);
                    }

                    return target[key];
                }
            },
            set: function (target, key, value) {
                if ((key === "parentProxy") || (key === "proxyFieldName")) {
                    target[key] = value;
                    return true;
                }

                target[key] = value;

                if (handlers.set) {
                    handlers.set(target, key, value);
                }

                return true;
            }
        };

        return new Proxy({}, watcher);
    }

    rootComponentRendered(): void {
    }

    stageWillEnter(): void {}
}