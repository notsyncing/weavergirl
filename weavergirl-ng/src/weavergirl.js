"use strict";

(function () {
    if (!window.Weavergirl) {
        window.Weavergirl = {
            _tests: {}
        };
    }
})();

(function () {

    let modules = new Map();
    let base = location.href;
    let afterLoadHandlers = [];

    function absolute(relative) {
        let stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); // remove current file name (or empty string)
                     // (omit if "base" is the current folder without trailing slash)
        for (let i = 0; i < parts.length; i++) {
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
            pathOrUrl = absolute(pathOrUrl);
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

        let _module = { exports: exports };

        let f = new Function("module", "exports", script);
        f.call({}, _module, exports);

        modules.get(pathOrUrl).exports = _module.exports;

        for (let h of afterLoadHandlers) {
            h(_module.exports);
        }

        return _module.exports;
    }

    async function loadAsset(pathOrUrl) {
        if (!/^[a-zA-Z0-9]+:\/\//.test(pathOrUrl)) {
            pathOrUrl = absolute(pathOrUrl);
        }

        return await loadFromUrl(pathOrUrl);
    }

    function rebase() {
        base = location.href;
    }

    function addAfterLoadHandler(h) {
        afterLoadHandlers.push(h);
    }

    window.Weavergirl.Loader = {
        load: load,
        loadAsset: loadAsset,
        fetch: fetch,
        rebase: rebase,
        addAfterLoadHandler: addAfterLoadHandler
    };

})();

(function () {

    let stylesheets = new Set();
    let fragments = new Map();
    let stages = new Map();
    let mutatorFunctions = new Map();

    class Component extends HTMLElement {
        constructor(contentUrl, stylesheetUrls, scriptUrls) {
            console.info(`Constructor: contentUrl ${contentUrl}`);

            super();

            this.contentUrl = contentUrl;
            this.stylesheetUrls = stylesheetUrls;
            this.scriptUrls = scriptUrls;

            this.content = "";
            this.route = null;

            if (this.stageClass) {
                if (stages.has(this.constructor.name)) {
                    this.stage = stages.get(this.constructor.name);
                    this.stage.rootComponent = this;
                } else {
                    this.stage = new this.stageClass(this);
                    stages.set(this.constructor.name, this.stage);
                }
            } else {
                this.stage = null;
            }

            this.allDependenciesLoaded = false;
            this.refreshPlanned = false;
            this.rendered = false;
        }

        loadStylesheet(url) {
            if (stylesheets.has(url)) {
                return;
            }

            stylesheets.add(url);

            let elem = document.createElement("link");
            elem.rel = "stylesheet";
            elem.type = "text/css";
            elem.href = url;

            document.head.appendChild(elem);
        }

        dependencies() {
            return {
                scripts: [],
                stylesheets: []
            };
        }

        html(strings, ...values) {
            return TemplateUtils.html(strings, ...values);
        }

        async loadDependencies() {
            if (this.allDependenciesLoaded) {
                return;
            }

            this.allDependenciesLoaded = true;

            let deps = this.dependencies();

            if (deps.scripts.length > 0) {
                for (let url of deps.scripts) {
                    await window.Weavergirl.Loader.load(url);
                }
            }

            if (deps.stylesheets.length > 0) {
                for (let url of deps.stylesheets) {
                    this.loadStylesheet(url);
                }
            }

            if (this.stylesheetUrls) {
                for (let url of this.stylesheetUrls) {
                    this.loadStylesheet(url);
                }
            }

            if (this.contentUrl) {
                if (fragments.has(this.contentUrl)) {
                    this.content = fragments.get(this.contentUrl);
                } else {
                    this.content = await window.Weavergirl.Loader.loadAsset(this.contentUrl);
                    fragments.set(this.contentUrl, this.content);
                }
            }

            if (this.scriptUrls) {
                for (let url of this.scriptUrls) {
                    await window.Weavergirl.Loader.load(url);
                }
            }
        }

        _attachStageToSelfElements() {
            this._walkSelfElements(elem => {
                elem.stage = this.stage;
            }, this);
        }

        async render() {
            if (!this.ownerDocument.defaultView) {
                console.info(`${this.id || this.tagName} has not been inserted into DOM, skip rendering.`);
                return;
            }

            await this.loadDependencies();

            let r = this.getRenderContent();
            let renderedContent;

            if (r instanceof Promise) {
                renderedContent = await r;
            } else {
                renderedContent = r;
            }

            this.attachRenderedContentToDom(renderedContent);
            this._attachElementsToProperties();
            this._attachStageToSelfElements();

            if ((this.stage) && (this.stage.rootComponent === this)) {
                this.stage.rootComponentRendered();
            }

            this.afterRender();
        }

        afterRender() {}

        connectedCallback() {
            console.info(`Attached ${this.id || this.tagName} to DOM, contentUrl ${this.contentUrl}`);
            console.dir(this);

            this.render()
                .then(() => {
                    console.info(`Rendered element ${this.id || this.tagName}`);
                })
                .catch(err => {
                    console.error(`An error occured when rendering component ${this.id || this.tagName}: ${err.message}`);
                    console.error(err);
                });
        }

        disconnectedCallback() {

        }

        attributeChangedCallback(attrName, oldVal, newVal) {

        }

        findSlotElement(node) {
            if (!node) {
                node = this;
            }

            if (!(node instanceof Element)) {
                return null;
            }

            if (node.hasAttribute("weavergirl-slot")) {
                return node;
            }

            if (node.childNodes.length > 0) {
                for (let c of node.childNodes) {
                    let r = this.findSlotElement(c);

                    if (r) {
                        return r;
                    }
                }
            }

            return null;
        }

        _processElementIds(content) {
            let elem = document.createElement("div");
            elem.innerHTML = content;

            function _process(e) {
                if (!(e instanceof Element)) {
                    return;
                }

                if (e.hasAttribute("id")) {
                    if (!e.hasAttribute("weavergirl-keep-id")) {
                        let id = e.getAttribute("id");
                        e.removeAttribute("id");
                        e.setAttribute("data-weavergirl-id", id);
                    }
                }

                for (let c of e.childNodes) {
                    _process(c);
                }
            }

            _process(elem);

            return elem.innerHTML;
        }

        _attachElementsToProperties() {
            let _this = this;
            let attachToStage = (this.stage) && (this.stage.rootComponent === this);

            function _process(elem) {
                if (!(elem instanceof Element)) {
                    return;
                }

                if (elem.hasAttribute("data-weavergirl-id")) {
                    let id = elem.getAttribute("data-weavergirl-id");
                    _this[id] = elem;

                    if (attachToStage) {
                        _this.stage[id] = elem;
                    }
                }

                for (let c of elem.childNodes) {
                    _process(c);
                }
            }

            _process(this);
        }

        attachRenderedContentToDom(renderedContent) {
            if ((renderedContent === null) || (renderedContent === undefined)) {
                return;
            }

            let oldChildContainer = this;

            console.info(`Element ${this.id || this.tagName}: rendered ${this.rendered}`);

            if (this.rendered) {
                 oldChildContainer = this.findSlotElement(this);
            }

            let oldChildNodes = oldChildContainer ? Array.prototype.slice.call(oldChildContainer.childNodes) : [];

            this.innerHTML = this._processElementIds(renderedContent);

            let slotElement = this.findSlotElement(this);

            if (slotElement) {
                console.info(`Found slot element ${slotElement.id || slotElement.tagName} in ${this}, append ${oldChildNodes.length} children to it`);

                for (let oldChild of oldChildNodes) {
                    slotElement.appendChild(oldChild);
                }
            }

            this.rendered = true;
        }

        getRenderContent() {
            if (!this.contentUrl) {
                this.content = this.view();
                return this.content;
            } else if (this.content) {
                let f = new Function("return `" + this.content + "`");
                return f.call(this);
            } else {
                return null;
            }
        }

        view() {
            return null;
        }

        async refresh() {
            if (this.refreshPlanned) {
                console.info("A refresh is already planned, skip.");
                return;
            }

            this.refreshPlanned = true;

            await this.render();
            console.info(`Refreshed ${this.id || this.tagName}`);

            this.refreshPlanned = false;
        }

        async refreshCascade() {
            console.info(`Begin cascade refresh of ${this.id || this.tagName}`);

            await this.refresh();

            let slotElem = this.findSlotElement();

            async function _process(elem) {
                for (let c of elem.childNodes) {
                    if (c instanceof Component) {
                        await c.refreshCascade();
                    } else {
                        await _process(c);
                    }
                }
            }

            if (slotElem) {
                await _process(slotElem);
            }

            console.info(`End cascade refresh of ${this.id || this.tagName}`);
        }

        routeChanged(resolvedRoute) {
            let params = resolvedRoute.queries || {};

            for (let c of resolvedRoute.commands) {
                for (let p of Object.keys(c.parameters)) {
                    params[p] = c.parameters[p];
                }
            }

            this.route = {
                parameters: params
            };

            if ((this.stage) && (this.stage.rootComponent === this)) {
                this.stage.stageWillEnter();
            }
        }

        _walkSelfNodes(handler, elem) {
            for (let e of elem.childNodes) {
                handler(e);

                this._walkSelfNodes(handler, e);
            }
        }

        _walkSelfElements(handler, elem) {
            this._walkSelfNodes(n => {
                if (!(n instanceof Element)) {
                    return;
                }

                if (n.hasAttribute("weavergirl-slot")) {
                    return;
                }

                handler(n);
            }, elem);
        }

        getSelfElementsByTagName(tagName) {
            let elems = [];

            this._walkSelfElements(e => {
                if (e.tagName.toUpperCase() === tagName.toUpperCase()) {
                    elems.push(e);
                }
            }, this);

            return elems;
        }

        get stageClass() {
            return null;
        }

        _walkSelfMutators(handler, elem) {
            let mutatorStack = [];
            let beginPattern = "#weavergirl-mutator ";
            let endPattern = "#/weavergirl-mutator";
            let mutators = [];

            this._walkSelfNodes(n => {
                if (n.nodeType !== Node.COMMENT_NODE) {
                    return;
                }

                let s = n.textContent;

                if (s.startsWith(beginPattern)) {
                    s = s.substring(beginPattern.length);
                    let mutatorInfo = JSON.parse(s);

                    mutatorStack.push({
                        info: mutatorInfo,
                        parent: n.parentNode,
                        beginPatternNode: n,
                        beginIndex: Array.prototype.indexOf.call(n.parentNode.childNodes, n) + 1
                    });
                } else if (s === endPattern) {
                    let mutator = mutatorStack.pop();

                    if (!mutator) {
                        console.dir(n);
                        throw new Error(`Unpaired mutator end pattern found at ${n}`);
                    }

                    mutator.endPatternNode = n;
                    mutator.endIndex = Array.prototype.indexOf.call(n.parentNode.childNodes, n);
                    mutator.childNodes = [];

                    for (let i = mutator.beginIndex; i < mutator.endIndex; i++) {
                        mutator.childNodes.push(mutator.parent.childNodes[i]);
                    }

                    mutators.push(mutator);
                }
            }, elem);

            for (let m of mutators) {
                handler(m);
            }
        }

        updateMutator(mutatorExpression, changeType, newValue) {
            console.info(`Update mutators on ${this.id || this.tagName} with expression ${mutatorExpression} = ${newValue}, key/changeType ${changeType}`);

            let found = false;

            this._walkSelfMutators(mutator => {
                if (mutator.info.expression === mutatorExpression) {
                    switch (mutator.info.type) {
                        case "inline":
                            let f = mutatorFunctions.get(mutatorExpression).bind(this);

                            if (mutator.childNodes.length > 0) {
                                mutator.childNodes[0].textContent = f();
                            } else {
                                let n = document.createTextNode(f());
                                mutator.parent.insertBefore(n, mutator.endPatternNode);
                            }

                            found = true;
                            break;
                        case "repeater":

                            break;
                        default:
                            throw new Error(`Unsupported mutator type ${mutator.info.type}, mutator ${JSON.stringify(mutator.info)}`);
                    }
                }
            }, this);

            if (found) {
                console.info(`Found matching mutators.`);
            } else {
                console.info(`No matching mutator found.`);
            }

            return found;
        }
    }

    window.Weavergirl.Component = Component;

    window.Weavergirl.Loader.addAfterLoadHandler(function (exports) {
        if (!exports) {
            return;
        }

        if (Component.isPrototypeOf(exports)) {
            let name = exports.name.replace(/(?:^|\.?)([A-Z])/g, (x, y) => "-" + y.toLowerCase()).replace(/^-/, "");
            customElements.define(name, exports);
        }
    });

    class TemplateUtils {
        static html(strings, ...values) {
            let i = 0, j = 0;
            let s = "";

            while ((i < strings.length) || (j < values.length)) {
                if (i < strings.length) {
                    s += strings[i];
                    i++;
                }

                if (j < values.length) {
                    let v = values[j];
                    j++;

                    if (v instanceof Promise) {
                        // TODO: Implement this!
                    } else if (typeof v === "function") {
                        s += TemplateUtils._convertExpressionToMutatorElement(v);
                    } else {
                        s += v;
                    }
                }
            }

            return s;
        }

        static _extractExpressionFromFunction(funcContainsExpression) {
            let source = funcContainsExpression.toString();
            return source.replace(/\(\)\s*=>\s*/g, "").replace(/this\.stage\.state\./g, "");
        }

        static _convertExpressionToMutatorElement(funcContainsExpression) {
            let expression = TemplateUtils._extractExpressionFromFunction(funcContainsExpression);
            mutatorFunctions.set(expression, funcContainsExpression);

            return `<!--#weavergirl-mutator { "type": "inline", "expression": "${expression}" }-->${funcContainsExpression()}<!--#/weavergirl-mutator-->`;
        }

        static forEach(list, handler) {
            let s = "";

            if (typeof list === "function") {
                let expression = TemplateUtils._extractExpressionFromFunction(list);
                s += `<!--#weavergirl-mutator { "type": "repeater", "expression": "${expression}" }-->`;
            }

            for (let i = 0; i < list.length; i++) {
                let item = handler(list[i], i);

                // TODO: Parse and replace loop index variable in mutator expression

                s += item;
            }

            if (typeof list === "function") {
                s += "<!--#/weavergirl-mutator-->";
            }

            return s;
        }
    }

    window.T = TemplateUtils;

})();

(function () {

    function getFullExpression(proxy, key, previousString) {
        let s = previousString || "";

        if (proxy.proxyFieldName) {
            let f = proxy.proxyFieldName;

            if (!isNaN(f)) {
                f = `[${f}]`;
            }

            s = f + s;

            if (key) {
                if ((proxy instanceof Array) && (!isNaN(key))) {
                    s += "["
                } else {
                    s += ".";
                }
            }
        }

        if (key) {
            s += key;

            if ((proxy instanceof Array) && (!isNaN(key))) {
                s += "]";
            }
        }

        if (proxy.parentProxy) {
            if (proxy.parentProxy.proxyFieldName) {
                if ((proxy.proxyFieldName) && (isNaN(proxy.proxyFieldName))) {
                    s = "." + s;
                }
            }

            return getFullExpression(proxy.parentProxy, null, s);
        }

        return s;
    }

    function newWatchedObject(handlers) {
        let watcher = {
            get: function (target, key) {
                if ((typeof target[key] === "object") && (target[key] !== null)) {
                    let p = new Proxy(target[key], watcher);
                    p.parentProxy = target;
                    p.proxyFieldName = key;

                    return p;
                } else {
                    if (handlers.get) {
                        handlers.get(target, key);
                    }

                    return target[key];
                }
            },
            set: function (target, key, value) {
                if ((key === "parentProxy") || (key === "proxyFieldName")) {
                    target[key] = value;
                    return true;
                }

                target[key] = value;

                if (handlers.set) {
                    handlers.set(target, key, value);
                }

                return true;
            }
        };

        return new Proxy({}, watcher);
    }

    class Stage {
        constructor(rootComponent) {
            this.rootComponent = rootComponent;

            let _this = this;

            let watcher = {
                set: function (target, key, value) {
                    console.dir(target);
                    console.info(`Stage ${_this.constructor.name} state change detected: on ${target} key ${key} value ${value}`);

                    let expr = getFullExpression(target, key);
                    _this.rootComponent.updateMutator(expr, key, value);
                }
            };

            this.state = newWatchedObject(watcher);

            this.stageWillEnter();
        }

        rootComponentRendered() {
        }

        stageWillEnter() {}
    }

    window.Weavergirl.Stage = Stage;

    window.Weavergirl._tests.getFullExpression = getFullExpression;
    window.Weavergirl._tests.newWatchedObject = newWatchedObject;

    let RouterMode = {
        Direct: 0,
        QueryString: 1
    };

    let RouterCommand = {
        Load: 0
    };

    class Router {
        constructor() {
            this.routes = [];
            this.mode = RouterMode.Direct;
        }

        init(routes, mode, _noGo) {
            this.routes = routes || [];
            this.mode = mode || RouterMode.Direct;

            let route = this.resolve(this.getCurrentPath(), location.search);

            if (!_noGo) {
                this.go(route);
                history.replaceState(route, "", route.url);
            }
        }

        getCurrentPath() {
            switch (this.mode) {
                case RouterMode.Direct:
                    return location.pathname;
                case RouterMode.QueryString:
                    let qs = this.getQueryStringParameters(location.search);
                    return qs.route || "/";
                default:
                    throw new Error(`Unsupported router mode ${this.mode}`);
            }
        }

        getQueryStringParameters(query) {
            if (!query) {
                return {};
            }

            return (/^[?#]/.test(query) ? query.slice(1) : query)
                .split('&')
                .reduce((params, param) => {
                    let [ key, value ] = param.split('=');
                    params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                    return params;
                }, {});
        }

        matchPathWithRoute(path, route) {
            let pattern = route.route;

            if ((pattern.indexOf("/:") < 0) && (pattern.indexOf("*") < 0)) {
                if (!path.startsWith(pattern)) {
                    return false;
                }
            }

            if (path[0] !== "/") {
                path = "/" + path;
            }

            if (path[path.length - 1] === "/") {
                path = path.substring(0, path.length - 1);
            }

            if (pattern[0] !== "/") {
                pattern = "/" + pattern;
            }

            if (pattern[pattern.length - 1] === "/") {
                pattern = pattern.substring(0, pattern.length - 1);
            }

            let parameters = {};
            let pathParts = path.split("/");
            let patternParts = pattern.split("/");

            if (pathParts.length < patternParts.length) {
                return false;
            } else if (pathParts.length > patternParts.length) {
                if (!route.children) {
                    return false;
                }
            }

            for (let i = 0; i < patternParts.length; i++) {
                let currPatternPart = patternParts[i];
                let currPathPart = pathParts[i];

                if (currPatternPart.startsWith(":")) {
                    let parameterName = currPatternPart.substring(1);
                    parameters[parameterName] = currPathPart;
                    continue;
                }

                if (currPatternPart === "*") {
                    continue;
                }

                if (currPatternPart !== currPathPart) {
                    return false;
                }
            }

            return {
                parameters: parameters,
                remainPath: "/" + pathParts.slice(patternParts.length).join("/")
            };
        }

        _resolve(currPath, currRoute, prevResult) {
            let matchResult = this.matchPathWithRoute(currPath, currRoute);

            if (matchResult === false) {
                return null;
            }

            let componentUrl, componentId = null;

            if (typeof currRoute.component === "string") {
                componentUrl = currRoute.component;
            } else {
                componentUrl = currRoute.component.url;
                componentId = currRoute.component.id;
            }

            prevResult.push({
                command: RouterCommand.Load,
                url: componentUrl,
                componentId: componentId,
                parameters: matchResult.parameters
            });

            currPath = matchResult.remainPath;

            if (currRoute.children) {
                for (let r of currRoute.children) {
                    let resolvedRoute = this._resolve(currPath, r, prevResult);

                    if (resolvedRoute) {
                        return resolvedRoute;
                    }
                }

                return null;
            } else {
                return prevResult;
            }
        }

        resolve(path, queryString) {
            if (queryString) {
                if (queryString.indexOf("?") >= 0) {
                    queryString = queryString.substring(1);
                }
            }

            for (let r of this.routes) {
                let resolvedRouteCommands = this._resolve(path, r, []);

                if (resolvedRouteCommands) {
                    return {
                        url: `${location.protocol}//${location.host}${path}${queryString ? `?${queryString}` : ""}`,
                        commands: resolvedRouteCommands,
                        queries: this.getQueryStringParameters(queryString)
                    };
                }
            }

            return null;
        }

        async go(resolvedRoute, needToPushState) {
            console.info(`Go to resolved route: ${JSON.stringify(resolvedRoute)}, need to push state ${needToPushState}`);

            let currLayout = document.body;

            for (let cmd of resolvedRoute.commands) {
                switch (cmd.command) {
                    case RouterCommand.Load:
                        let elemClass = await Weavergirl.Loader.load(cmd.url);
                        let alreadyLoaded = null;

                        for (let child of currLayout.childNodes) {
                            if (child.constructor === elemClass) {
                                alreadyLoaded = child;
                                break;
                            }
                        }

                        if (!alreadyLoaded) {
                            let elem = new elemClass();

                            if (cmd.componentId) {
                                elem.id = cmd.componentId;
                            }

                            elem.routeChanged(resolvedRoute);

                            if (currLayout instanceof Weavergirl.Component) {
                                currLayout = currLayout.findSlotElement();
                            }

                            while (currLayout.firstChild) {
                                currLayout.removeChild(currLayout.firstChild);
                            }

                            currLayout.appendChild(elem);
                            currLayout = elem;
                        } else {
                            console.info(`Layout element ${alreadyLoaded.id || alreadyLoaded.tagName} already present on page, refresh it.`);

                            currLayout = alreadyLoaded;

                            if (alreadyLoaded instanceof Weavergirl.Component) {
                                alreadyLoaded.routeChanged(resolvedRoute);
                                alreadyLoaded.refresh();
                            }
                        }

                        break;
                    default:
                        throw new Error(`Unsupported router command ${cmd.command}, route info ${JSON.stringify(resolvedRoute)}, at ${JSON.stringify(cmd)}`);
                }
            }

            if (needToPushState) {
                history.pushState(resolvedRoute, "", resolvedRoute.url);
            }
        }

        navigate(url) {
            let elem = document.createElement("a");
            elem.href = url;

            let resolvedRoute = this.resolve(elem.pathname, elem.search);
            return this.go(resolvedRoute, true);
        }
    }

    window.onpopstate = function (event) {
        Weavergirl.Router.go(event.state, false);
    };

    window.Weavergirl.Router = new Router();
    window.Weavergirl.RouterMode = RouterMode;
    window.Weavergirl.RouterCommand = RouterCommand;

})();