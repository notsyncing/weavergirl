export default class FormUtils {
    static configs = {
        ignoreInvisibleFields: false,
        ignoreHiddenFields: false,
        uncheckedAsFalse: true,
    };

    private static getInputElementValue(inputElem: Element,
                                        uncheckedAsFalse: boolean = FormUtils.configs.uncheckedAsFalse): string | number | boolean {
        let type = inputElem.getAttribute("type");

        if ((type === "button") || (type === "submit")) {
            return null;
        }

        if (FormUtils.configs.ignoreHiddenFields) {
            if (type === "hidden") {
                return null;
            }
        }

        if (FormUtils.configs.ignoreInvisibleFields) {
            if (window.getComputedStyle(inputElem).display === "none") {
                return null;
            }
        }

        if (inputElem instanceof HTMLInputElement) {
            if (type === "checkbox") {
                uncheckedAsFalse = uncheckedAsFalse || FormUtils.configs.uncheckedAsFalse;

                if (!uncheckedAsFalse) {
                    if (!inputElem.checked) {
                        return null;
                    }
                }

                return inputElem.getAttribute("value") == null ? inputElem.checked : (inputElem.checked ? inputElem.value : null);
            } else if (type === "radio") {
                if (!inputElem.checked) {
                    return null;
                }

                return inputElem.value;
            } else if (type === "number") {
                return Number(inputElem.value);
            } else {
                return inputElem.value;
            }
        } else if (inputElem instanceof HTMLSelectElement) {
            if ((inputElem.options.length > 0) && (inputElem.selectedIndex >= 0)) {
                return (inputElem.options[inputElem.selectedIndex] as HTMLOptionElement).value;
            } else {
                return null;
            }
        } else if (inputElem instanceof HTMLTextAreaElement) {
            return inputElem.value;
        }

        return null;
    }
    
    private static serializeInputElement(inputElem: Element, obj: any): any {
        let name = inputElem.getAttribute("name");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        let value = FormUtils.getInputElementValue(inputElem);

        if ((value === null) || (value === undefined)) {
            return;
        }

        if (!obj) {
            obj = {};
        }

        let objRef = obj;
        let objRefParentArray = null;
        let objRefParentArrayIndex = 0;
        let lastNameStart = 0;
        let finalFieldName;
        let partName;
        let len;

        for (let i = 0; i < name.length; i++) {
            if (name[i] === ".") {
                partName = name.substring(lastNameStart, i).replace(/\[(.*?)\]/g, "");

                if ((!partName) || (partName.length <= 0)) {
                    continue;
                }

                if (!objRef[partName]) {
                    objRef[partName] = {};
                    objRef = objRef[partName];
                } else if (objRef[partName] instanceof Array) {
                    len = objRef[partName].push({});
                    objRef = objRef[partName][len - 1];
                } else {
                    objRef = objRef[partName];
                }

                objRefParentArray = null;
                lastNameStart = i + 1;
            } else if (name[i] === "]") {
                let indexBegin = i - 1;

                while (name[indexBegin] !== "[") {
                    indexBegin--;
                }

                let indexStr = name.substring(indexBegin + 1, i);
                partName = name.substring(lastNameStart, indexBegin);

                if (partName[0] === ".") {
                    partName = partName.substring(1);
                }

                if (!objRef[partName]) {
                    objRef[partName] = [];
                }

                if (indexStr === "") {
                    len = objRef[partName].push({});
                    objRefParentArray = objRef[partName];
                    objRefParentArrayIndex = len - 1;
                    objRef = objRef[partName][len - 1];
                } else {
                    let arrIndex = Number(indexStr);
                    objRefParentArray = objRef[partName];
                    objRefParentArrayIndex = arrIndex;

                    if (!objRef[partName][arrIndex]) {
                        objRef[partName][arrIndex] = {};
                    }

                    objRef = objRef[partName][arrIndex];
                }

                lastNameStart = i + 1;
            }
        }

        if (lastNameStart === 0) {
            finalFieldName = name;
        } else {
            finalFieldName = name.substring(lastNameStart);
        }

        while (finalFieldName[0] === ".") {
            finalFieldName = finalFieldName.substring(1);
        }

        if (objRefParentArray !== null) {
            if (name[name.length - 1] !== "]") {
                let lastArrayObjIndex = objRefParentArrayIndex - 1;
                let lastArrayObj = objRefParentArray[lastArrayObjIndex];

                while ((lastArrayObj === undefined) && (lastArrayObjIndex >= 0)) {
                    lastArrayObjIndex--;
                    lastArrayObj = objRefParentArray[lastArrayObjIndex];
                }

                if ((lastArrayObj !== undefined) && (lastArrayObj[finalFieldName] === undefined)) {
                    lastArrayObj[finalFieldName] = value;
                    objRefParentArray.splice(objRefParentArrayIndex, 1);
                } else {
                    objRef[finalFieldName] = value;
                }
            } else {
                objRefParentArray[objRefParentArrayIndex] = value;
            }
        } else {
            objRef[finalFieldName] = value;
        }

        return obj;
    }

    private static setInputElementValue(inputElem: Element, value: any) {
        let type = inputElem.getAttribute("type");

        if ((type === "button") || (type === "submit")) {
            return;
        }

        if (inputElem instanceof HTMLInputElement) {
            if (type === "file") {
                return;
            }

            if (type === "checkbox") {
                if (inputElem.getAttribute("value") != null) {
                    inputElem.checked = value == inputElem.getAttribute("value");
                } else {
                    inputElem.checked = value;
                }
            } else if (type === "radio") {
                inputElem.checked = (inputElem.value == value);
            } else if (type === "number") {
                inputElem.value = Number(value).toString();
            } else {
                inputElem.value = value;
            }
        } else if (inputElem instanceof HTMLSelectElement) {
            for (let i = 0; i < inputElem.options.length; i++) {
                if (inputElem.options[i].value == value) {
                    inputElem.selectedIndex = i;
                    break;
                }
            }
        } else if (inputElem instanceof HTMLTextAreaElement) {
            inputElem.value = value;
        }
    }

    private static parseInputElement(arrayCounters: any, inputElem: HTMLInputElement | HTMLTextAreaElement,
                                     data: any): void {
        let name = inputElem.getAttribute("name");
        let rawName = name;
        let type = inputElem.getAttribute("type");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        let value;

        if (data instanceof Array) {
            let skip = 0;

            for (let i = 0; i < data.length; i++) {
                if (data[i].name === rawName) {
                    if ((type === "checkbox") && (inputElem.value != null) && (inputElem.value != data[i].value)) {
                        skip++;
                        continue;
                    }

                    if (!arrayCounters[rawName]) {
                        arrayCounters[rawName] = 0;
                    } else if (skip < arrayCounters[rawName]) {
                        skip++;
                        continue;
                    }

                    value = data[i].value;
                    arrayCounters[rawName]++;

                    break;
                }
            }
        } else {
            let lastIndexName;

            while (name.indexOf("[]") >= 0) {
                let unindexedArrayEnd = name.indexOf("[]");

                if (arrayCounters[name] === undefined) {
                    arrayCounters[name] = -1;
                }

                lastIndexName = name;
                arrayCounters[name]++;
                name = name.substring(0, unindexedArrayEnd) + "[" +
                    arrayCounters[name] + "]" + name.substring(unindexedArrayEnd + 2);
            }

            let split = ".";

            if (name.indexOf("[") === 0) {
                split = "";
            }

            value = (new Function("data", "return data" + split + name + ";"))(data);

            if ((type === "checkbox") && (inputElem.value != null) && (value != inputElem.value)) {
                arrayCounters[lastIndexName]--;
            }
        }

        FormUtils.setInputElementValue(inputElem, value);
    }

    private static serializeInputElementSimple(inputElem: HTMLInputElement | HTMLTextAreaElement,
                                               uncheckedAsFalse: boolean = true): any {
        let name = inputElem.getAttribute("name");

        if ((!name) || (name.length <= 0)) {
            return;
        }

        let value = FormUtils.getInputElementValue(inputElem, uncheckedAsFalse);

        if ((value === null) || (value === undefined)) {
            return;
        }

        return { name: name, value: value };
    }

    static parse(formElem: Element, data: any): void {
        let inputElems = formElem.querySelectorAll("input, select, textarea");
        let arrayCounters = {};

        for (let i = 0; i < inputElems.length; i++) {
            FormUtils.parseInputElement(arrayCounters, inputElems.item(i) as (HTMLInputElement | HTMLTextAreaElement),
                data);
        }
    };

    static serializeSimple(formElem: Element, uncheckedAsFalse: boolean = true): any {
        let arr = [];
        let inputElems = formElem.querySelectorAll("input, select, textarea");

        for (let i = 0; i < inputElems.length; i++) {
            let p = FormUtils.serializeInputElementSimple(inputElems.item(i) as (HTMLInputElement | HTMLTextAreaElement),
                uncheckedAsFalse);

            if (!p) {
                continue;
            }

            arr.push(p);
        }

        return arr;
    };

    static serializeToJson(formElem: Element): any {
        let obj = {};
        let inputElems = formElem.querySelectorAll("input, select, textarea");

        for (let e of inputElems) {
            FormUtils.serializeInputElement(e, obj);
        }

        return obj;
    };
}
