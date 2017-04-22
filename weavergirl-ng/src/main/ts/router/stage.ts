import Component from "../component/component";

export default class Stage {
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

        this.stageWillEnter();
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