import Validator from "../validator";
import FormValidation from "../form-validation";

export class MatchValidator extends Validator {
    check(elem: HTMLElement, parameters: any = null): boolean {
        if ((elem instanceof HTMLInputElement) || (elem instanceof HTMLTextAreaElement)) {
            let target = document.querySelector(parameters.selector as string) as HTMLInputElement;

            return target.value === elem.value;
        }

        return false;
    }

    getName(): string {
        return "match";
    }
}

FormValidation.addValidator(MatchValidator);