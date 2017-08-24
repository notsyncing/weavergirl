import Component from "../component/component";
import {Mutator} from "../component/mutator";
import MutatorHub from "../component/mutator-hub";

export default class Stage {
    mutatorHub = new MutatorHub(this);

    private _state: any = null;
    private watcher: any = {};
    private inInit = true;

    recordStack: Array<Array<string>> = [];

    constructor(public rootComponent: Component) {
        let __this = this;

        this.watcher = {
            get: function (target, key, result) {
                if (__this.recordStack.length > 0) {
                    let l = __this.recordStack[__this.recordStack.length - 1];
                    l.push(Stage.getFullExpression(target, key));
                }

                return result;
            },
            set: function (target, key, value) {
                if (__this.inInit) {
                    return;
                }

                console.dir(target);
                console.info(`Stage ${__this.constructor.name} state change detected: on ${target} key ${key} value ${value}`);

                let expr = Stage.getFullExpression(target, key);
                __this.rootComponent.updateMutators(expr, key, value);
            }
        };

        this.state = {};

        this.init();

        this.state["_attributes"] = {};

        this.inInit = false;
    }

    async earlyInit(): Promise<any> {

    }

    init() {

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
                    endPatternNode: null
                });
            } else if (s === MutatorHub.mutatorEndPattern) {
                let mutator = tempStack.pop();

                if (!mutator) {
                    console.dir(node);
                    throw new Error(`Unpaired mutator end pattern found at ${node}`);
                }

                mutator.endPatternNode = node;

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
                        endPatternNode: null
                    };

                    handler(mutator);
                } else if (a.name === "data-weavergirl-bind-mutator") {
                    let mutatorInfo = JSON.parse(decodeURIComponent(a.value));

                    let mutator: Mutator = {
                        stage: this,
                        info: mutatorInfo,
                        parent: node,
                        beginPatternNode: null,
                        endPatternNode: null
                    };

                    handler(mutator);
                }
            }
        }
    }

    static getFullExpression(proxy: any, key: any, previousString = ""): string {
        let s = previousString;

        if (proxy.__proxyFieldName) {
            let f = proxy.__proxyFieldName;

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

        if (proxy.__parentProxy) {
            if (proxy.__parentProxy.__proxyFieldName) {
                if ((proxy.__proxyFieldName) && (isNaN(proxy.__proxyFieldName))) {
                    s = "." + s;
                }
            }

            return Stage.getFullExpression(proxy.__parentProxy, null, s);
        }

        return s;
    }

    static newWatchedObject(obj, handlers): any {
        let watcher = {
            get: function (target, key) {
                if ((key === "__parentProxy") || (key === "__proxyFieldName")) {
                    return target[key];
                }

                let r: any;

                if ((typeof target[key] === "object") && (target[key] !== null) && (target[key] !== undefined)) {
                    if (target[key].__parentProxy === undefined) {
                        let p = new Proxy(target[key], watcher) as any;

                        Object.defineProperty(p, "__parentProxy", {
                            value: target,
                            enumerable: false
                        });

                        Object.defineProperty(p, "__proxyFieldName", {
                            value: key,
                            enumerable: false
                        });

                        target[key] = p;
                    }
                }

                r = target[key];

                if (handlers.get) {
                    let r2 = handlers.get(target, key, r);

                    if (r2 !== r) {
                        r = r2;
                    }
                }

                return r;
            },
            set: function (target, key, value) {
                if ((key === "__parentProxy") || (key === "__proxyFieldName")) {
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

    componentAttributeChanged(attrName: string, oldVal: string, newVal: string): void {
        this.state["_attributes"][attrName] = newVal;
    }

    addComponentAttribute(attrName: string, value: string): void {
        this.state["_attributes"][attrName] = value;
    }

    rootComponentRendered(): void {
    }

    stageWillEnter(): void {}

    stageDidEnter(): void {}

    beginRecord(into: Array<string>): void {
        this.recordStack.push(into);
    }

    endRecord(): void {
        this.recordStack.pop();
    }
}