import {AttributeMutatorInfo, DelegateMutatorInfo, MutatorInfo} from "./mutator";
import MutatorHub from "./mutator-hub";
import Component from "./component";

enum TemplateState {
    Unknown,
    InTag,
    InContent
}

export default class TemplateUtils {
    constructor(public component: Component) {
    }

    private determineState(currStr: string): TemplateState {
        let state = TemplateState.Unknown;

        for (let i = 0; i < currStr.length; i++) {
            let c = currStr[i];
            let c2 = null;
            let c0 = null;

            if (i < currStr.length - 1) {
                c2 = currStr[i + 1];
            }

            if (i > 0) {
                c0 = currStr[i - 1];
            }

            switch (state) {
                case TemplateState.Unknown:
                    if ((c === '<') && (c2 !== '!')) {
                        state = TemplateState.InTag;
                    } else if ((c === '>') && (c0 !== '-') ){
                        state = TemplateState.InContent;
                    }

                    break;
                case TemplateState.InTag:
                    if ((c === '>') && (c0 !== '-')) {
                        state = TemplateState.InContent;
                    }

                    break;
                case TemplateState.InContent:
                    if ((c === '<') && (c2 !== '!')) {
                        state = TemplateState.InTag;
                    }

                    break;
                default:
                    throw new Error(`Unsupported template state ${state} when parsing ${currStr}`);
            }
        }

        return state;
    }

    private escapeQuotes(str: string): string {
        return str.replace(/"/g, "%22");
    }

    private escapeRegExp(str) {
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }

    html(strings, ...values): string {
        let i = 0, j = 0;
        let s = "";
        let state = TemplateState.Unknown;

        while ((i < strings.length) || (j < values.length)) {
            if (i < strings.length) {
                s += strings[i];
                state = this.determineState(strings[i]);

                i++;
            }

            if (j < values.length) {
                let v = values[j];
                j++;

                if (v instanceof Promise) {
                    // TODO: Implement this!
                } else if (v instanceof ContextContent) {
                    s += (v as ContextContent).getContent({state: state});
                } else if (typeof v === "function") {
                    s += this.convertExpressionToMutatorElement(v);
                } else {
                    s += v;
                }
            }
        }

        return s;
    }

    makeMutatorBegin(info: MutatorInfo): string {
        return `<!--${MutatorHub.mutatorBeginPattern}${JSON.stringify(info)}-->`;
    }

    makeMutatorEnd(): string {
        return `<!--${MutatorHub.mutatorEndPattern}-->`;
    }

    private convertExpressionToMutatorElement(funcContainsExpression: Function): string {
        let exprList = [];
        let mutatorId = MutatorHub.allocateMutatorId();
        this.component.stage.mutatorHub.setMutatorFunction(mutatorId, funcContainsExpression);

        this.component.stage.beginRecord(exprList);

        let inner = funcContainsExpression();

        this.component.stage.endRecord();

        return `${this.makeMutatorBegin({ id: mutatorId, type: "inline", expressions: exprList })}${inner}${this.makeMutatorEnd()}`;
    }

    forEach(list: Function | Array<any>, handler: (item: any, index: number) => string, _noMutatorNode = false): string {
        let s = "";
        let l: Array<any>;
        let mutatorBegin: MutatorInfo = null;
        let listIsFunction = false;
        let expression: string;

        if (typeof list === "function") {
            listIsFunction = true;
            let exprList = [];

            this.component.stage.beginRecord(exprList);

            l = list() as Array<any>;

            this.component.stage.endRecord();

            expression = exprList[exprList.length - 1];
            exprList.push(expression + ".length");

            if (!_noMutatorNode) {
                mutatorBegin = {
                    id: MutatorHub.allocateMutatorId(),
                    type: "repeater",
                    expressions: exprList
                };

                this.component.stage.mutatorHub.setMutatorFunction(mutatorBegin.id,
                    () => this.forEach(list, handler, true));
            }
        } else {
            l = list as Array<any>;
        }

        for (let i = 0; i < l.length; i++) {
            let item = handler(l[i], i);

            if (expression) {
                let itemMutatorBegin = {
                    id: MutatorHub.allocateMutatorId(),
                    type: "repeater",
                    expressions: [`${expression}[${i}]`]
                };

                this.component.stage.mutatorHub.setMutatorFunction(itemMutatorBegin.id, () => {
                    let l: Array<any>;

                    if (listIsFunction) {
                        l = (list as Function)() as Array<any>;
                    } else {
                        l = list as Array<any>;
                    }

                    return handler(l[i], i);
                });

                s += `${this.makeMutatorBegin(itemMutatorBegin)}${item}${this.makeMutatorEnd()}`;
            } else {
                s += item;
            }
        }

        if (mutatorBegin !== null) {
            s = `${this.makeMutatorBegin(mutatorBegin)}${s}${this.makeMutatorEnd()}`;
        }

        return s;
    }

    when(field: any | Function): SwitchTemplate {
        return new SwitchTemplate(field, this);
    }

    private makeAttributeMutator(info: MutatorInfo): string {
        return `weavergirl-mutator-${info.id}="${this.escapeQuotes(JSON.stringify(info))}"`;
    }

    attr(name: string, value: string | Function): string {
        if (typeof value === "function") {
            let exprList = [];

            this.component.stage.beginRecord(exprList);

            let v = value();

            this.component.stage.endRecord();

            let mutator: AttributeMutatorInfo = {
                id: MutatorHub.allocateMutatorId(),
                type: "attribute",
                expressions: exprList,
                attribute: name
            };

            this.component.stage.mutatorHub.setMutatorFunction(mutator.id, value);

            return `${name}="${v}" ${this.makeAttributeMutator(mutator)}`;
        } else {
            return `${name}="${value}"`;
        }
    }

    bind(toField: Function): string {
        let exprList = [];

        this.component.stage.beginRecord(exprList);

        toField();

        this.component.stage.endRecord();

        let mutator: DelegateMutatorInfo = {
            id: MutatorHub.allocateMutatorId(),
            type: "delegate",
            expressions: exprList,
            delegate: "this.bindMutatorHandler"
        };

        this.component.stage.mutatorHub.setMutatorFunction(mutator.id, toField);

        return `data-weavergirl-bind-mutator="${this.escapeQuotes(JSON.stringify(mutator))}"`;
    }
}

class SwitchTemplate {
    private fieldIsFunction = false;
    private mutatorBegin: MutatorInfo = null;
    private conditions: Array<any> = [];
    private otherwiseFunction: () => string = null;

    constructor(private field: any | Function, private templateUtils: TemplateUtils) {
        if (typeof field === "function") {
            this.fieldIsFunction = true;

            let exprList = [];

            templateUtils.component.stage.beginRecord(exprList);

            this.toStringWithoutMutator();

            templateUtils.component.stage.endRecord();

            this.mutatorBegin = {
                id: MutatorHub.allocateMutatorId(),
                type: "repeater",
                expressions: exprList
            };

            this.templateUtils.component.stage.mutatorHub.setMutatorFunction(this.mutatorBegin.id, () => {
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

    toString(): string {
        return this.toStringWithoutMutator(false);
    }

    toStringWithoutMutator(without = true): string {
        let str = "";
        let result: any;

        if (this.fieldIsFunction) {
            result = (this.field as Function)();
        } else {
            result = this.field;
        }

        let noOtherwise = false;

        for (let c of this.conditions) {
            let passed = false;

            if (typeof c.condition === "function") {
                passed = c.condition(result);
            } else {
                passed = c.condition === result;
            }

            if (passed) {
                noOtherwise = true;
                str += c.handler();
            }
        }

        if (!noOtherwise) {
            if (this.otherwiseFunction) {
                str += this.otherwiseFunction();
            }
        }

        if ((without) || (!this.mutatorBegin)) {
            return str;
        } else {
            return `${this.templateUtils.makeMutatorBegin(this.mutatorBegin)}${str}${this.templateUtils.makeMutatorEnd()}`;
        }
    }
}

interface TemplateContext {
    state: TemplateState
}

class ContextContent {
    constructor(private handler: (context: TemplateContext) => string) {
    }

    getContent(context: TemplateContext): string {
        return this.handler(context);
    }
}