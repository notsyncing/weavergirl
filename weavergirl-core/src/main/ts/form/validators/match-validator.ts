import Validator from "../validator";

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

