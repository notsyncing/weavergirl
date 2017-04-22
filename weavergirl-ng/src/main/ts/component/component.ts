import TemplateUtils from "./template-utils";
import Loader from "../loader/loader";

export default class Component extends HTMLElement {
    static stylesheets = new Set<string>();
    static fragments = new Map();
    static stages = new Map();
    static mutatorFunctions = new Map();

    private contentUrl: string = null;
    private stylesheetUrls: Array<string> = null;
    private scriptUrls: Array<string> = null;

    private content: string = "";
    private route = null;
    private stage = null;

    private allDependenciesLoaded = false;
    private refreshPlanned = false;
    private rendered = false;

    constructor(contentUrl, stylesheetUrls, scriptUrls) {
        super();

        console.info(`Constructor: contentUrl ${contentUrl}`);

        this.contentUrl = contentUrl;
        this.stylesheetUrls = stylesheetUrls;
        this.scriptUrls = scriptUrls;

        if (this.stageClass) {
            if (Component.stages.has(this.constructor.name)) {
                this.stage = Component.stages.get(this.constructor.name);
                this.stage.rootComponent = this;
            } else {
                this.stage = new this.stageClass(this);
                Component.stages.set(this.constructor.name, this.stage);
            }
        } else {
            this.stage = null;
        }
    }

    private loadStylesheet(url) {
        if (Component.stylesheets.has(url)) {
            return;
        }

        Component.stylesheets.add(url);

        let elem = document.createElement("link");
        elem.rel = "stylesheet";
        elem.type = "text/css";
        elem.href = url;

        document.head.appendChild(elem);
    }

    protected dependencies() {
        return {
            scripts: [],
            stylesheets: []
        };
    }

    html(strings, ...values) {
        return TemplateUtils.html(strings, ...values);
    }

    private async loadDependencies() {
        if (this.allDependenciesLoaded) {
            return;
        }

        this.allDependenciesLoaded = true;

        let deps = this.dependencies();

        if (deps.scripts.length > 0) {
            for (let url of deps.scripts) {
                await Loader.load(url);
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
            if (Component.fragments.has(this.contentUrl)) {
                this.content = Component.fragments.get(this.contentUrl);
            } else {
                this.content = await Loader.loadAsset(this.contentUrl);
                Component.fragments.set(this.contentUrl, this.content);
            }
        }

        if (this.scriptUrls) {
            for (let url of this.scriptUrls) {
                await Loader.load(url);
            }
        }
    }

    private attachStageToSelfElements() {
        this.walkSelfElements(elem => {
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
        this.attachElementsToProperties();
        this.attachStageToSelfElements();

        if ((this.stage) && (this.stage.rootComponent === this)) {
            this.stage.rootComponentRendered();
        }

        this.afterRender();
    }

    protected afterRender() {}

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

    findSlotElement(node: Node = this) {
        if (!(node instanceof Element)) {
            return null;
        }

        let elem = node as Element;

        if (elem.hasAttribute("weavergirl-slot")) {
            return node;
        }

        if (elem.childNodes.length > 0) {
            for (let c of elem.childNodes) {
                let r = this.findSlotElement(c);

                if (r) {
                    return r;
                }
            }
        }

        return null;
    }

    private processElementIds(content) {
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

    private attachElementsToProperties() {
        let __this = this;
        let attachToStage = (this.stage) && (this.stage.rootComponent === this);

        function _process(elem) {
            if (!(elem instanceof Element)) {
                return;
            }

            if (elem.hasAttribute("data-weavergirl-id")) {
                let id = elem.getAttribute("data-weavergirl-id");
                __this[id] = elem;

                if (attachToStage) {
                    __this.stage[id] = elem;
                }
            }

            for (let c of elem.childNodes) {
                _process(c);
            }
        }

        _process(this);
    }

    private attachRenderedContentToDom(renderedContent) {
        if ((renderedContent === null) || (renderedContent === undefined)) {
            return;
        }

        let oldChildContainer = this;

        console.info(`Element ${this.id || this.tagName}: rendered ${this.rendered}`);

        if (this.rendered) {
            oldChildContainer = this.findSlotElement(this);
        }

        let oldChildNodes = oldChildContainer ? Array.prototype.slice.call(oldChildContainer.childNodes) : [];

        this.innerHTML = this.processElementIds(renderedContent);

        let slotElement = this.findSlotElement(this);

        if (slotElement) {
            console.info(`Found slot element ${slotElement.id || slotElement.tagName} in ${this}, append ${oldChildNodes.length} children to it`);

            for (let oldChild of oldChildNodes) {
                slotElement.appendChild(oldChild);
            }
        }

        this.rendered = true;
    }

    private getRenderContent() {
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

    protected view() {
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

    private walkSelfNodes(handler, elem) {
        for (let e of elem.childNodes) {
            handler(e);

            this.walkSelfNodes(handler, e);
        }
    }

    private walkSelfElements(handler, elem) {
        this.walkSelfNodes(n => {
            if (!(n instanceof Element)) {
                return;
            }

            if (n.hasAttribute("weavergirl-slot")) {
                return;
            }

            handler(n);
        }, elem);
    }

    protected getSelfElementsByTagName(tagName) {
        let elems = [];

        this.walkSelfElements(e => {
            if (e.tagName.toUpperCase() === tagName.toUpperCase()) {
                elems.push(e);
            }
        }, this);

        return elems;
    }

    protected get stageClass() {
        return null;
    }

    private walkSelfMutators(handler, elem) {
        let mutatorStack = [];
        let beginPattern = "#weavergirl-mutator ";
        let endPattern = "#/weavergirl-mutator";
        let mutators = [];

        this.walkSelfNodes(n => {
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

        this.walkSelfMutators(mutator => {
            if (mutator.info.expression === mutatorExpression) {
                switch (mutator.info.type) {
                    case "inline":
                        let f = Component.mutatorFunctions.get(mutatorExpression).bind(this);

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

Loader.addAfterLoadHandler(function (exports) {
    if (!exports) {
        return;
    }

    if (Component.isPrototypeOf(exports)) {
        let name = exports.name.replace(/(?:^|\.?)([A-Z])/g, (x, y) => "-" + y.toLowerCase()).replace(/^-/, "");
        customElements.define(name, exports);
    }
});