export interface AlternativeCookieHeaders {
    requestHeader: string;
    requestValue: string;
    cookie: string;
    setCookie: string;
    storeTo: any;
}

export class Http {
    static alternativeCookieHeaders: AlternativeCookieHeaders = {
        requestHeader: null,
        requestValue: null,
        cookie: null,
        setCookie: null,
        storeTo: localStorage
    };

    static denyCORSCredentials = false;

    private static COOKIE_STORE_NAME = "__weavergirl_cookies__";

    private static processSendAlternativeCookieHeaders(xhr: XMLHttpRequest): void
    {
        let ch = Http.alternativeCookieHeaders;

        if ((!ch) || (!ch.storeTo) || (!ch.cookie)) {
            return;
        }

        if (ch.requestHeader) {
            xhr.setRequestHeader(ch.requestHeader, ch.requestValue);
        }

        if (ch.storeTo === window.document) {
            xhr.setRequestHeader(ch.cookie, document.cookie);
        } else if (ch.storeTo === window.localStorage) {
            let cookies = JSON.parse(localStorage.getItem(Http.COOKIE_STORE_NAME) || "{}");
            let cookieList = [];

            for (let key in cookies) {
                if (!cookies.hasOwnProperty(key)) {
                    continue;
                }

                cookieList.push(key + "=" + cookies[key]);
            }

            if (cookieList.length > 0) {
                xhr.setRequestHeader(ch.cookie, cookieList.join("; "));
            }
        }
    }

    private static processReceivedAlternativeCookieHeaders(xhr: XMLHttpRequest): void {
        let ch = Http.alternativeCookieHeaders;

        if ((!ch) || (!ch.storeTo) || (!ch.setCookie)) {
            return;
        }

        let rawHeaders = xhr.getAllResponseHeaders();

        if (!rawHeaders) {
            return;
        }

        let headers = rawHeaders.split("\r\n");
        let setCookieHeader;
        let setCookieStart = ch.setCookie + ": ";

        for (let i = 0; i < headers.length; i++) {
            if (headers[i].indexOf(setCookieStart) === 0) {
                setCookieHeader = headers[i].substring(setCookieStart.length);
                break;
            }
        }

        if (!setCookieHeader) {
            return;
        }

        let setCookieHeaders = [];
        let l = setCookieHeader.split(", ");

        for (let i = 0; i < l.length; i++) {
            if ((i > 0) && (l[i].indexOf("=") < 0)) {
                setCookieHeaders[setCookieHeaders.length - 1] += ", " + l[i];
            } else {
                setCookieHeaders.push(l[i]);
            }
        }

        if (ch.storeTo === window.document) {
            for (let i = 0; i < setCookieHeaders.length; i++) {
                document.cookie = setCookieHeaders[i];
            }
        } else if (ch.storeTo === window.localStorage) {
            let cookies = JSON.parse(localStorage.getItem(Http.COOKIE_STORE_NAME) || "{}");

            for (let i = 0; i < setCookieHeaders.length; i++) {
                let cl = setCookieHeaders[i].split("; ");
                let cookieData = {
                    name: null,
                    value: null,
                    expires: null
                };

                for (let j = 0; j < cl.length; j++) {
                    let kv = cl[j].split("=");

                    if (j === 0) {
                        cookieData.name = kv[0];
                        cookieData.value = kv[1];
                    } else {
                        cookieData[kv[0]] = kv[1];
                    }
                }

                cookies[cookieData.name] = cookieData.value;

                if (cookieData["max-age"]) {
                    if (cookieData["max-age"] == 0) {
                        delete cookies[cookieData.name];
                    } else if (cookieData["max-age"] < 0) {
                        // TODO: Implement temporary cookie!
                    }
                } else if (cookieData.expires) {
                    let expireDate = Date.parse(cookieData.expires);
                    let nowDate = new Date();

                    if (expireDate < nowDate) {
                        delete cookies[cookieData.name];
                    }
                }
            }

            localStorage.setItem(Http.COOKIE_STORE_NAME, JSON.stringify(cookies));
        }
    }

    static ajax(method: string, url: string, data: any = null, xhrFields: any = {}): Promise {
        return new Promise((resolve, reject) => {
            try {
                let xhr = new XMLHttpRequest();
                xhr.open(method, url, true);

                if (!this.denyCORSCredentials) {
                    xhr.withCredentials = true;
                }

                if (xhrFields) {
                    for (let key in xhrFields) {
                        if (!xhrFields.hasOwnProperty(key)) {
                            continue;
                        }

                        xhr[key] = xhrFields[key];
                    }
                }

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === (xhr.DONE || 4)) {
                        if (xhr.status === 200) {
                            Http.processReceivedAlternativeCookieHeaders(xhr);

                            let data = xhr.responseText;

                            if (xhr.getResponseHeader("Content-Type") == "application/json") {
                                data = JSON.parse(data);
                            }

                            return resolve({response: data, xhr: xhr});
                        } else {
                            return reject(new Error(xhr.status + ": " + xhr.statusText + "\n > when accessing " + url +
                                " with " + method + " data " + JSON.stringify(data) + " xhrFields " +
                                JSON.stringify(xhrFields)));
                        }
                    }
                };

                Http.processSendAlternativeCookieHeaders(xhr);

                if (data) {
                    xhr.send(data);
                } else {
                    xhr.send();
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    static get(url: string, xhrFields: any = {}): Promise {
        return Http.ajax("GET", url, null, xhrFields);
    }

    static post(url: string, data: any, xhrFields: any = {}): Promise {
        return Http.ajax("POST", url, data, xhrFields);
    }

    static put(url: string, data: any, xhrFields: any = {}): Promise {
        return Http.ajax("PUT", url, data, xhrFields);
    }

    static deleteUrl(url: string, xhrFields: any = {}): Promise {
        return Http.ajax("DELETE", url, null, xhrFields);
    }
}