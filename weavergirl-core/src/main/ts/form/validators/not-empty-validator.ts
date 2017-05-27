import Validator from "../validator";
import FormValidation from "../form-validation";

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

FormValidation.addValidator(NotEmptyValidator);