import Validator from "../validator";
import FormValidation from "../form-validation";

export class NumberRangeValidator extends Validator {
    private checkRange(num: number, rule: any) {
        if (rule.min !== undefined) {
            if (num < rule.min) {
                return false;
            }
        }

        if (rule.minNotEqual !== undefined) {
            if (num <= rule.minNotEqual) {
                return false;
            }
        }

        if (rule.max !== undefined) {
            if (num > rule.max) {
                return false;
            }
        }

        if (rule.maxNotEqual !== undefined) {
            if (num >= rule.maxNotEqual) {
                return false;
            }
        }

        return true;
    }

    check(elem: HTMLElement, parameters: any = null): boolean {
        if ((elem instanceof HTMLInputElement) || (elem instanceof HTMLTextAreaElement)) {
            if ((elem.value === "") || (isNaN(elem.value as any))) {
                return false;
            }

            let number = Number(elem.value);

            if (parameters instanceof Array) {
                for (let r of parameters) {
                    if (this.checkRange(number, r)) {
                        return true;
                    }
                }

                return false;
            } else {
                return this.checkRange(number, parameters);
            }
        }

        return false;
    }

    getName(): string {
        return "numberRange";
    }
}

FormValidation.addValidator(NumberRangeValidator);