import Validator from "../validator";

Number.isInteger = Number.isInteger || function(value) {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
};

export class IntegerValidator extends Validator {
    check(elem: HTMLElement, parameters: any = null): boolean {
        if ((elem instanceof HTMLInputElement) || (elem instanceof HTMLTextAreaElement)) {
            if (elem.value === "") {
                return false;
            }

            if (isNaN(elem.value as any)) {
                return false;
            }

            return Number.isInteger(Number(elem.value));
        }

        return false;
    }

    getName(): string {
        return "integer";
    }
}

