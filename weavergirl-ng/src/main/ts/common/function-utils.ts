export default class FunctionUtils {
    static extractExpressionFromFunction(funcContainsExpression: Function): string {
        let source = funcContainsExpression.toString();

        return source.replace(/\/\*(.*?)\*\//g, "")
            .replace(/\(\)\s*=>\s*/g, "")
            .replace(/function\s*\((.*?)\)\s*/g, "")
            .replace(/{\s*return\s*/g, "")
            .replace(/;\s*}/g, "")
            .replace(/[a-zA-Z0-9_]*this[a-zA-Z0-9_]*\.stage\.state\./g, "");
    }

    static getFunctionArguments(func: Function): Array<string> {
        let source = func.toString();

        console.info("extractExpressionFromFunction: " + source);

        let s = source.replace(/\/\*(.*?)\*\//g, "")
            .replace(/[\r\t]/g, "\s")
            .replace(/function\s*/g, "");

        if (s.indexOf('\n') > 0) {
            s = s.substring(0, s.indexOf('\n'));
        }

        if (s.indexOf("=>") > 0) {
            s = s.substring(0, s.indexOf("=>"))
                .trim();
        } else {
            s = s.substring(0, s.indexOf("{"))
                .trim();
        }

        let argString = s.replace(/\s/g, "");

        if (argString.startsWith("(")) {
            argString = argString.substring(1, argString.length - 1);
        }

        return argString.split(",");
    }
}