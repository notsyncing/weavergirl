import Validator from "../validator";
import FormValidation from "../form-validation";

export class NumberValidator extends Validator {
    check(elem: HTMLElement, parameters: any = null): boolean {
        if ((elem instanceof HTMLInputElement) || (elem instanceof HTMLTextAreaElement)) {
            if (elem.value === "") {
                return false;
            }

            return !isNaN(elem.value as any);
        }

        return false;
    }

    getName(): string {
        return "number";
    }
}

FormValidation.addValidator(NumberValidator);