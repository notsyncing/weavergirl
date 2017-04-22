import Component from "./component";

export default class TemplateUtils {
    static html(strings, ...values) {
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

    static _extractExpressionFromFunction(funcContainsExpression) {
        let source = funcContainsExpression.toString();
        return source.replace(/\(\)\s*=>\s*/g, "").replace(/this\.stage\.state\./g, "");
    }

    static _convertExpressionToMutatorElement(funcContainsExpression) {
        let expression = TemplateUtils._extractExpressionFromFunction(funcContainsExpression);
        Component.mutatorFunctions.set(expression, funcContainsExpression);

        return `<!--#weavergirl-mutator { "type": "inline", "expression": "${expression}" }-->${funcContainsExpression()}<!--#/weavergirl-mutator-->`;
    }

    static forEach(list, handler) {
        let s = "";

        if (typeof list === "function") {
            let expression = TemplateUtils._extractExpressionFromFunction(list);
            s += `<!--#weavergirl-mutator { "type": "repeater", "expression": "${expression}" }-->`;
        }

        for (let i = 0; i < list.length; i++) {
            let item = handler(list[i], i);

            // TODO: Parse and replace loop index variable in mutator expression

            s += item;
        }

        if (typeof list === "function") {
            s += "<!--#/weavergirl-mutator-->";
        }

        return s;
    }
}