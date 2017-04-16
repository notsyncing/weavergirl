(function () {
    if (!window.Weavergirl) {
        window.Weavergirl = {};
    }
})();

(function () {

    let modules = new Map();

    function absolute(relative) {
        let base = location.href;
        let stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); // remove current file name (or empty string)
                     // (omit if "base" is the current folder without trailing slash)
        for (let i=0; i<parts.length; i++) {
            if (parts[i] === ".")
                continue;
            if (parts[i] === "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }

    function fetch(url) {
        return new Promise((resolve, reject) => {
            try {
                let xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);

                xhr.onreadystatechange = () => {
                    if (xhr.readyState === (XMLHttpRequest.DONE || 4)) {
                        if (xhr.status === 200) {
                            resolve(xhr.responseText);
                        } else {
                            reject(new Error(`Server returned status code ${xhr.status}: GET ${url}`));
                        }
                    }
                };

                xhr.send();
            } catch (err) {
                reject(err);
            }
        });
    }

    function loadFromUrl(url) {
        return fetch(url);
    }

    async function load(pathOrUrl) {
        if (!/^[a-zA-Z0-9]+:\/\//.test(pathOrUrl)) {
            if (!pathOrUrl.startsWith("/")) {
                pathOrUrl = absolute(pathOrUrl);
            }
        }

        if (modules.has(pathOrUrl)) {
            return modules.get(pathOrUrl).exports;
        }

        const script = await loadFromUrl(pathOrUrl);
        let exports = {};

        modules.set(pathOrUrl, {
            script: script,
            exports: exports
        });

        let f = new Function("_exports", "var exports = _exports;\n\n" + script);
        f.call(exports);
    }

    window.Weavergirl.Loader = {
        load: load,
        fetch: fetch
    };

})();

(function () {

    let stylesheets = new Set();
    let fragments = new Map();

    class WeavergirlComponent extends HTMLElement {
        constructor(contentUrl, stylesheetUrls, scriptUrls) {
            super();

            this.contentUrl = contentUrl;
            this.stylesheetUrls = stylesheetUrls;
            this.scriptUrls = scriptUrls;

            this.content = "";
            this.model = null;
            this.modelProxy = null;
        }

        createdCallback() {

        }

        loadStylesheet(url) {
            let elem = document.createElement("link");
            elem.rel = "stylesheet";
            elem.type = "text/css";
            elem.href = url;

            document.head.appendChild(elem);
        }

        async loadDependencies() {
            if (this.stylesheetUrls) {
                for (let url of this.stylesheetUrls) {
                    if (stylesheets.has(url)) {
                        continue;
                    }

                    this.loadStylesheet(url);
                }
            }

            if (this.contentUrl) {
                if (fragments.has(this.contentUrl)) {
                    this.content = fragments.get(this.contentUrl);
                } else {
                    this.content = await window.Weavergirl.Loader.fetch(this.contentUrl);
                    fragments.set(this.contentUrl, this.content);
                }
            }

            if (this.scriptUrls) {
                for (let url of this.scriptUrls) {
                    await window.Weavergirl.Loader.load(url);
                }
            }
        }

        async _render() {
            await this.loadDependencies();

            let r = this.render();
            let renderedContent;

            if (r instanceof Promise) {
                renderedContent = await r;
            } else {
                renderedContent = r;
            }

            this.attachRenderedContentToDom(renderedContent);
        }

        attachedCallback() {
            this._render().then(() => {})
                    .catch(err => {
                        console.error(`An error occured when rendering component ${this}: ${err.message}`);
                        console.error(err);
                    });
        }

        detachedCallback() {

        }

        attributeChangedCallback(attrName, oldVal, newVal) {

        }

        attachRenderedContentToDom(renderedContent) {
            if ((renderedContent === null) || (renderedContent === undefined)) {
                return;
            }

            this.innerHTML = renderedContent;
        }

        render() {
            if (this.content) {
                return this.content;
            } else {
                return null;
            }
        }

        async refresh() {
            await this._render();
        }

        bindToModel(model) {
            if (!model) {
                return;
            }

            let watcher = {
                get: function (target, key) {
                    if ((typeof target[key] === "object") && (target[key] !== null)) {
                        return new Proxy(target[key], watcher);
                    } else {
                        return target[key];
                    }
                },
                set: function (target, key, value) {
                    this.refresh().then(() => {})
                        .catch(err => {
                            console.error(`An error occured when refreshing component ${this} on model change [${target}.${key} -> ${value}]: ${err.message}`);
                            console.error(err);
                        });
                }
            };

            this.model = model;
            this.modelProxy = new Proxy(this.model, watcher);
        }
    }

    window.Weavergirl.WeavergirlComponent = WeavergirlComponent;

})();