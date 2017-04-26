import Component from "../component/component";
import {Mutator} from "../component/mutator";

export default class Stage {
    private static mutatorCounter = 0;

    static mutatorBeginPattern = "#weavergirl-mutator ";
    static mutatorEndPattern = "#/weavergirl-mutator";

    static mutatorFunctions = new Map<number, Function>();

    mutators = new Map<string, Array<Mutator>>();

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

    static allocateMutatorId(): number {
        let n = Stage.mutatorCounter;
        Stage.mutatorCounter++;
        return n;
    }

    static setMutatorFunction(id: number, func: Function): void {
        Stage.mutatorFunctions.set(id, func);
    }

    registerMutator(mutator: Mutator, _into = this.mutators): void {
        if (!_into.has(mutator.info.expression)) {
            _into.set(mutator.info.expression, [mutator]);
        } else {
            let l = _into.get(mutator.info.expression);

            for (let m of l) {
                if (m.info.id === mutator.info.id) {
                    return;
                }
            }

            l.push(mutator);
        }
    }

    handleMutatorNode(node: Node, tempStack: Array<Mutator>, handler: (mutator: Mutator) => void): void {
        if (node.nodeType === Node.COMMENT_NODE) {
            let s = node.textContent;

            if (s.startsWith(Stage.mutatorBeginPattern)) {
                s = s.substring(Stage.mutatorBeginPattern.length);
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
            } else if (s === Stage.mutatorEndPattern) {
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

    clearMutators(): void {
        this.mutators.clear();
        Stage.mutatorFunctions.clear();
    }

    static resetMutatorId(): void {
        Stage.mutatorCounter = 0;
    }

    static resetMutators(): void {
        for (let s of Component.stages.values()) {
            s.clearMutators();
        }

        Stage.resetMutatorId();
    }

    static collectUnusedMutatorId(elem: Node = document): void {
        if (Stage.mutatorFunctions.size <= 0) {
            console.info(`Mutator cache collection result: no need to collect.`);
            return;
        }

        let newFunctionMap = new Map<number, Function>();
        let newStageMutatorMap = new Map<Stage, Map<string, Array<Mutator>>>();

        let mutatorStack: Array<Mutator> = [];

        function _process(stage: Stage, n: Node) {
            stage.handleMutatorNode(n, mutatorStack, m => {
                if (Stage.mutatorFunctions.has(m.info.id)) {
                    newFunctionMap.set(m.info.id, Stage.mutatorFunctions.get(m.info.id));
                }

                stage.registerMutator(m, newStageMutatorMap.get(stage));
            });

            for (let c of n.childNodes) {
                _process(stage, c);
            }
        }

        for (let s of Component.stages.values()) {
            newStageMutatorMap.set(s, new Map());
            _process(s, elem);

            console.info(`Stage ${s} mutator collection result: previous ${s.mutators.size}, now ${newStageMutatorMap.get(s).size}, collected ${newStageMutatorMap.get(s).size - s.mutators.size}`);

            s.mutators = newStageMutatorMap.get(s);
        }

        console.info(`Mutator cache collection result: previous ${Stage.mutatorFunctions.size}, now ${newFunctionMap.size}, collected ${Stage.mutatorFunctions.size - newFunctionMap.size}`);

        Stage.mutatorFunctions = newFunctionMap;
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