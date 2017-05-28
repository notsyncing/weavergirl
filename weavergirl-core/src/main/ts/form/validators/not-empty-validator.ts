import Validator from "../validator";

export class NotEmptyValidator extends Validator {
    check(elem: HTMLElement, parameters: any = null): boolean {
        if ((elem instanceof HTMLInputElement) || (elem instanceof HTMLTextAreaElement)) {
            return !((elem.value === "") || (elem.value === null) || (elem.value === undefined));
        }

        return false;
    }

    getName(): string {
        return "notEmpty";
    }
}

