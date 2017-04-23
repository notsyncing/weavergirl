import Component from "./component";
import {MutatorInfo} from "./mutator";
import FunctionUtils from "../common/function-utils";

export default class TemplateUtils {
    static html(strings, ...values): string {
        let i = 0, j = 0;
        let s = "";

        while ((i < strings.length) || (j < values.length)) {
            if (i < strings.length) {
                s += strings[i];
                i++;
            }

            if (j < values.length) {
                let v = values[j];
                j++;

                if (v instanceof Promise) {
                    // TODO: Implement this!
                } else if (typeof v === "function") {
                    s += TemplateUtils.convertExpressionToMutatorElement(v);
                } else {
                    s += v;
                }
            }
        }

        return s;
    }

    static makeMutatorBegin(info: MutatorInfo): string {
        return `<!--#weavergirl-mutator ${JSON.stringify(info)}-->`;
    }

    static makeMutatorEnd(): string {
        return "<!--#/weavergirl-mutator-->";
    }

    private static convertExpressionToMutatorElement(funcContainsExpression: Function): string {
        let expression = FunctionUtils.extractExpressionFromFunction(funcContainsExpression);
        let mutatorId = Component.allocateMutatorId();
        Component.setMutatorFunction(mutatorId, funcContainsExpression);

        return `${this.makeMutatorBegin({ id: mutatorId, type: "inline", expression: expression })}${funcContainsExpression()}${this.makeMutatorEnd()}`;
    }

    static forEach(list: Function | Array<any>, handler: (item: any, index: number) => string, _noMutatorNode = false): string {
        let s = "";
        let l: Array<any>;
        let mutatorBegin: MutatorInfo = null;
        let handlerArgs: Array<string>;
        let listIsFunction = false;
        let expression: string;

        if (typeof list === "function") {
            listIsFunction = true;
            expression = FunctionUtils.extractExpressionFromFunction(list as Function);
            handlerArgs = FunctionUtils.getFunctionArguments(handler);

            if (!_noMutatorNode) {
                mutatorBegin = {
                    id: Component.allocateMutatorId(),
                    type: "repeater",
                    expression: expression + ".length"
                };

                Component.setMutatorFunction(mutatorBegin.id, () => TemplateUtils.forEach(list, handler, true));
            }

            l = list() as Array<any>;
        } else {
            l = list as Array<any>;
        }

        for (let i = 0; i < l.length; i++) {
            let item = handler(l[i], i);

            if (listIsFunction) {
                let indexVarName = handlerArgs[1];
                let p = new RegExp(`([^a-zA-Z0-9_])(${indexVarName})([^a-zA-Z0-9_])`, "g");
                item = item.replace(p, `$1${i}$3`);
            }

            let itemMutatorBegin = {
                id: Component.allocateMutatorId(),
                type: "repeater",
                expression: `${expression}[${i}]`
            };

            Component.setMutatorFunction(itemMutatorBegin.id, () => {
                let l: Array<any>;

                if (listIsFunction) {
                    l = (list as Function)() as Array<any>;
                } else {
                    l = list as Array<any>;
                }

                return handler(l[i], i);
            });

            s += `${this.makeMutatorBegin(itemMutatorBegin)}${item}${this.makeMutatorEnd()}`;
        }

        if (mutatorBegin !== null) {
            s = `${this.makeMutatorBegin(mutatorBegin)}${s}${this.makeMutatorEnd()}`;
        }

        return s;
    }

    static when(field: any | Function): SwitchTemplate {
        return new SwitchTemplate(field);
    }
}

class SwitchTemplate {
    private fieldIsFunction = false;
    private mutatorBegin: MutatorInfo;
    private conditions: Array<any> = [];
    private otherwiseFunction: () => string;

    constructor(private field: any | Function) {
        if (typeof field === "function") {
            this.fieldIsFunction = true;

            this.mutatorBegin = {
                id: Component.allocateMutatorId(),
                type: "repeater",
                expression: FunctionUtils.extractExpressionFromFunction(field)
            };

            Component.setMutatorFunction(this.mutatorBegin.id, () => {
                return this.toStringWithoutMutator();
            });
        }
    }

    is(condition: any, handler: () => string): SwitchTemplate {
        this.conditions.push({ condition: condition, handler: handler });

        return this;
    }

    otherwise(handler: () => string): SwitchTemplate {
        this.otherwiseFunction = handler;

        return this;
    }

    toString() {
        return this.toStringWithoutMutator(false);
    }

    toStringWithoutMutator(without = true) {
        let str = "";
        let result: any;

        if (this.fieldIsFunction) {
            result = this.field();
        } else {
            result = this.field;
        }

        let noOtherwise = false;

        for (let c of this.conditions) {
            if (c.condition === result) {
                noOtherwise = true;
                str += c.handler();
            }
        }

        if (!noOtherwise) {
            str += this.otherwiseFunction();
        }

        if (without) {
            return str;
        } else {
            return `${TemplateUtils.makeMutatorBegin(this.mutatorBegin)}${str}${TemplateUtils.makeMutatorEnd()}`;
        }
    }
}