import Component from "./component";
import {MutatorInfo} from "./mutator";

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
                    s += TemplateUtils._convertExpressionToMutatorElement(v);
                } else {
                    s += v;
                }
            }
        }

        return s;
    }

    static _extractExpressionFromFunction(funcContainsExpression: Function): string {
        let source = funcContainsExpression.toString();
        return source.replace(/\(\)\s*=>\s*/g, "").replace(/this\.stage\.state\./g, "");
    }

    static makeMutatorBegin(info: MutatorInfo): string {
        return `<!--#weavergirl-mutator ${JSON.stringify(info)}-->`;
    }

    static makeMutatorEnd(): string {
        return "<!--#/weavergirl-mutator-->";
    }

    static _convertExpressionToMutatorElement(funcContainsExpression: Function): string {
        let expression = TemplateUtils._extractExpressionFromFunction(funcContainsExpression);
        Component.mutatorFunctions.set(expression, funcContainsExpression);

        return `${this.makeMutatorBegin({ type: "inline", expression: expression })}${funcContainsExpression()}${this.makeMutatorEnd()}`;
    }

    static forEach(list: Function | Array<any>, handler: (item: any, index: number) => string): string {
        let s = "";
        let l: Array<any>;
        let mutatorBegin: MutatorInfo = null;

        if (typeof list === "function") {
            let expression = TemplateUtils._extractExpressionFromFunction(list as Function);

            mutatorBegin = {
                type: "repeater",
                expression: expression
            };

            l = list() as Array<any>;
        } else {
            l = list as Array<any>;
        }

        for (let i = 0; i < l.length; i++) {
            let item = handler(l[i], i);

            // TODO: Parse and replace loop index variable in mutator expression

            s += item;
        }

        if (mutatorBegin !== null) {
            s = `${this.makeMutatorBegin(mutatorBegin)}${s}${this.makeMutatorEnd()}`;
        }

        return s;
    }
}