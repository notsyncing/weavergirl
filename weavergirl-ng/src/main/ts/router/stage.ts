import Component from "../component/component";
import {Mutator} from "../component/mutator";
import MutatorHub from "../component/mutator-hub";

export default class Stage {
    mutatorHub = new MutatorHub(this);

    private _state: any = null;
    private watcher: any = {};
    recordStack: Array<Array<string>> = [];

    constructor(public rootComponent: Component) {
        let __this = this;

        let callRecorder = function (oldCall, fullExpr) {
            return function () {
                let recordedExpressions: Array<string> = [];
                __this.beginRecord(recordedExpressions);

                let r = oldCall.apply(this, arguments);

                __this.endRecord();
                __this.mutatorHub.registerMutatorExpressionDependencies(fullExpr, recordedExpressions);

                return r;
            };
        };

        this.watcher = {
            get: function (target, key, result) {
                if ((typeof target[key] === "function") && (target.hasOwnProperty(key))) {
                    return callRecorder(result, Stage.getFullExpression(target, key));
                } else {
                    if (__this.recordStack.length > 0) {
                        let l = __this.recordStack[__this.recordStack.length - 1];
                        l.push(Stage.getFullExpression(target, key));
                    }

                    return result;
                }
            },
            set: function (target, key, value) {
                console.dir(target);
                console.info(`Stage ${__this.constructor.name} state change detected: on ${target} key ${key} value ${value}`);

                let expr = Stage.getFullExpression(target, key);
                __this.rootComponent.updateMutator(expr, key, value);
            }
        };

        this.state = {};

        setTimeout(() => {
            this.stageWillEnter();
        }, 0);
    }

    get state(): any {
        return this._state;
    }

    set state(s: any) {
        this._state = Stage.newWatchedObject(s, this.watcher);
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

    static newWatchedObject(obj, handlers): any {
        let watcher = {
            get: function (target, key) {
                let r: any;

                if ((typeof target[key] === "object") && (target[key] !== null)) {
                    let p = new Proxy(target[key], watcher) as any;
                    p.parentProxy = target;
                    p.proxyFieldName = key;

                    r = p;
                } else {
                    r = target[key];
                }

                if (handlers.get) {
                    let r2 = handlers.get(target, key, r);

                    if (r2 !== r) {
                        r = r2;
                    }
                }

                return r;
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

        return new Proxy(obj, watcher);
    }

    rootComponentRendered(): void {
    }

    stageWillEnter(): void {}

    beginRecord(into: Array<string>): void {
        this.recordStack.push(into);
    }

    endRecord(): void {
        this.recordStack.pop();
    }
}