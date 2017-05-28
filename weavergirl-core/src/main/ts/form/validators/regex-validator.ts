import Validator from "../validator";

export class RegexValidator extends Validator {
    check(elem: HTMLElement, parameters: any = null): boolean {
        if ((elem instanceof HTMLInputElement) || (elem instanceof HTMLTextAreaElement)) {
            let regex: RegExp;

            if (typeof parameters.regex === "string") {
                regex = new RegExp(parameters.regex, parameters.flag);
            } else {
                regex = parameters.regex;
            }

            return regex.test(elem.value);
        }

        return false;
    }

    getName(): string {
        return "regex";
    }
}

