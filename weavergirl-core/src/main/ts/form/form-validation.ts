import {ValidationRule} from "./validation-rule";
import Validator from "./validator";

export default class FormValidation {
    private static validators = new Map<string, Validator>();

    static addValidator(validator: any) {
        let v = new validator();
        FormValidation.validators.set(v.getName(), v);
    }

    static _findElementsByName(name: string, element: Element): Array<HTMLElement> {
        let l = [];

        let _process = function (elem) {
            if (elem.hasAttribute("name")) {
                if (name === elem.getAttribute("name")) {
                    l.push(elem);
                }
            }

            for (let e of elem.children) {
                _process(e);
            }
        };

        _process(element);

        return l;
    }

    static validate(form: HTMLFormElement, rules: Array<ValidationRule>): any {
        let passes = [];
        let errors = [];

        for (let rule of rules) {
            let elements: any = null;

            if (rule.id) {
                elements = form.querySelectorAll(`#${rule.id}`);
            } else if (rule.name) {
                elements = FormValidation._findElementsByName(rule.name, form);
            } else if (rule.selector) {
                elements = form.querySelectorAll(rule.selector);
            } else {
                throw new Error(`No selector in rule ${JSON.stringify(rule)} on form ${form}!`);
            }

            if (!elements) {
                errors.push({ element: null, message: `No element matching id ${rule.id}` });
                continue;
            }

            let validator = FormValidation.validators.get(rule.rule);

            if (!validator) {
                throw new Error(`Unknown validator ${rule.rule} for ${JSON.stringify(rule)} on form ${form} found!`);
            }

            for (let elem of elements) {
                if ((elem.offsetHeight === 0) && (elem.offsetWidth === 0)) {
                    continue;
                }

                try {
                    let r = validator.check(elem, rule.parameters);

                    if (r) {
                        passes.push({element: elem});
                    } else {
                        errors.push({element: elem, message: rule.message});
                    }
                } catch (err) {
                    errors.push({element: elem, message: err.message, error: err});
                }
            }
        }

        return {
            passes: passes,
            errors: errors,
            passed: errors.length <= 0
        };
    }
}