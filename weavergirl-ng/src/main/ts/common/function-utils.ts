export default class FunctionUtils {
    static extractExpressionFromFunction(funcContainsExpression: Function): string {
        let source = funcContainsExpression.toString();

        return source.replace(/\/\*(.*?)\*\//g, "")
            .replace(/\(\)\s*=>\s*/g, "")
            .replace(/function\s*\((.*?)\)\s*/g, "")
            .replace(/{\s*return\s*/g, "")
            .replace(/;\s*}/g, "")
            .replace(/this\.stage\.state\./g, "");
    }

    static getFunctionArguments(func: Function): Array<string> {
        let source = func.toString();

        let argString = source.replace(/\/\*(.*?)\*\//g, "")
            .replace(/[\r\n\t]/g, "\s")
            .replace(/function\s*/g, "")
            .replace(/\s*=>(.*?)$/g, "")
            .replace(/\s*{(.*?)}/g, "")
            .replace(/\s/g, "");

        if (argString.startsWith("(")) {
            argString = argString.substring(1, argString.length - 1);
        }

        return argString.split(",");
    }
}