import FormUtils from "./form-utils";
import {Http} from "../net/http";

export interface FormAjaxSubmitHooks {
    beforeSerialize?: (formElem: HTMLFormElement) => boolean;
    beforeSubmit?: (data: any) => Promise<boolean> | boolean;
    submit?: (formElem: HTMLFormElement, method: string, url: string, data: any) => Promise<any>;
    success?: (response: any, xhr: XMLHttpRequest) => void;
    failed?: (err: any) => void;
}

export class FormSubmit {
    static config = {
        serializeAsJsonToParameter: false
    };

    static ajaxSubmit(formElem: HTMLFormElement, hooks: FormAjaxSubmitHooks, opts: any): Promise<any> {
        let method = formElem.method || "get";
        let url = formElem.action || opts.url;
        let data;
        let dataIsMultipart = false;
    
        hooks = hooks || {};
        opts = opts || FormSubmit.config;
    
        if (typeof hooks.beforeSerialize === "function") {
            if (hooks.beforeSerialize(formElem) === false) {
                return Promise.reject(false);
            }
        }
    
        let serializeData = function () {
            if (opts.serializeAsJsonToParameter) {
                let o = FormUtils.serializeToJson(formElem);
                return opts.serializeAsJsonToParameter + "=" + encodeURIComponent(JSON.stringify(o));
            }
    
            return FormUtils.serializeSimple(formElem, true);
        };
    
        data = serializeData();
    
        if (method.toLowerCase() === "post") {
            if (formElem.enctype === "multipart/form-data") {
                dataIsMultipart = true;
            }
        }
    
        let p;
    
        if (hooks.beforeSubmit) {
            let result = hooks.beforeSubmit(data);
    
            if (result === false) {
                return Promise.reject(false);
            } else if (result instanceof Promise) {
                p = result;
            } else {
                p = Promise.resolve(true);
            }
        } else {
            p = Promise.resolve(true);
        }
    
        let oldData;
    
        return p.then(function (result) {
            if (!result) {
                return Promise.reject(null);
            } else {
                if (dataIsMultipart) {
                    oldData = serializeData();
                    FormUtils.parse(formElem, data);

                    data = new FormData(formElem);
                    FormUtils.parse(formElem, oldData);
                }
    
                if (hooks.submit) {
                    return hooks.submit(formElem, method, url, data);
                } else {
                    return Http.ajax(method, url, data);
                }
            }
        });
    }

    static ajaxify(formElem: HTMLFormElement, hooks: FormAjaxSubmitHooks, opts: any): void {
        formElem.addEventListener("submit", function (event) {
            event = event || window.event;
            event.preventDefault();

            hooks = hooks || {};
            opts = opts || FormUtils.configs;

            FormSubmit.ajaxSubmit(formElem, hooks, opts)
                .then(function (data) {
                    if (hooks.success) {
                        hooks.success(data.response, data.xhr);
                    }
                })
                .catch(function (error) {
                    if (error === false) {
                        return;
                    }

                    if (hooks.failed) {
                        hooks.failed(error);
                    }
                });

            return false;
        });
    };
}