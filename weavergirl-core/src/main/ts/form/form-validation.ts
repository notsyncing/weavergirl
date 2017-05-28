import {ValidationRule} from "./validation-rule";

export default class FormValidation {
    private static validators = new Map<string, Function>();

    static addValidator(validator: any) {
        let v = new validator();
        FormValidation.validators.set(v.getName(), v);
    }

    static _findElementsByName(name: string, element: Element): Array<HTMLElement> {
        let l = [];

        function _process(elem) {
            for (let e of elem.children) {
                if (e.hasAttribute("name")) {
                    if (name === e.getAttribute("name")) {
                        l.push(e);
                    }
                }

                for (let c of e.children) {
                    _process(c);
                }
            }
        }

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

            let validator = FormValidation.validators.get(rule.rule) as any;

            if (!validator) {
                throw new Error(`Unknown validator ${rule.rule} for ${JSON.stringify(rule)} on form ${form} found!`);
            }

            for (let elem of elements) {
                if (elem.getComputedStyle().display === "none") {
                    continue;
                }

                try {
                    let r = new validator().check(elem);

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