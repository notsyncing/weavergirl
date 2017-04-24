import TemplateUtils from "./template-utils";
import Loader from "../loader/loader";
import {ComponentDependencies} from "./component-dependencies";
import Stage from "../router/stage";
import {AttributeMutatorInfo, Mutator, MutatorInfo} from "./mutator";
import {ResolvedRoute} from "../router/router-models";

export default class Component extends HTMLElement {
    static stylesheets = new Set<string>();
    static fragments = new Map<string, string>();
    static stages = new Map<string, Stage>();

    private static mutatorFunctions = new Map<number, Function>();
    private static mutatorCounter = 0;

    private static mutatorBeginPattern = "#weavergirl-mutator ";
    private static mutatorEndPattern = "#/weavergirl-mutator";

    private content: string = "";
    private route = null;
    private stage = null;

    private allDependenciesLoaded = false;
    private refreshPlanned = false;
    private rendered = false;

    constructor(private contentUrl: string,
                private stylesheetUrls: Array<string> = null,
                private scriptUrls: Array<string> = null) {
        super();

        console.info(`Constructor: contentUrl ${contentUrl}`);

        if (this.stageClass) {
            if (Component.stages.has(this.constructor.name)) {
                this.stage = Component.stages.get(this.constructor.name);
                this.stage.rootComponent = this;
            } else {
                let c = this.stageClass as any;
                this.stage = new c(this);
                Component.stages.set(this.constructor.name, this.stage);
            }
        } else {
            this.stage = null;
        }
    }

    private loadStylesheet(url: string): void {
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

    protected dependencies(): ComponentDependencies {
        return {
            scripts: [],
            stylesheets: []
        };
    }

    html(strings, ...values): string {
        return TemplateUtils.html(strings, ...values);
    }

    private async loadDependencies(): Promise<void> {
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

    private attachStageToSelfElements(): void {
        this.walkSelfElements(elem => {
            elem["stage"] = this.stage;
            return true;
        }, this);
    }

    async render(): Promise<void> {
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

    protected afterRender(): void {}

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

    findSlotElement(node: Node = this): Element {
        if (!(node instanceof Element)) {
            return null;
        }

        let elem = node as Element;

        if (elem.hasAttribute("weavergirl-slot")) {
            return elem;
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

    private processElementIds(content: string): string {
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

    private attachElementsToProperties(): void {
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

    private attachRenderedContentToDom(renderedContent: string): void {
        if ((renderedContent === null) || (renderedContent === undefined)) {
            return;
        }

        let oldChildContainer: Element = this;

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

        this.walkSelfMutators(m => {
            if (Component.mutatorFunctions.has(m.info.id)) {
                if (m.info.type === "attribute") {

                } else {
                    m.beginPatternNode["_weavergirlMutatorFunction"] = Component.mutatorFunctions.get(m.info.id);
                    Component.mutatorFunctions.delete(m.info.id);
                }
            }
        }, this);

        this.rendered = true;
    }

    private getRenderContent(): any {
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

    protected view(): string {
        return null;
    }

    async refresh(): Promise<void> {
        if (this.refreshPlanned) {
            console.info("A refresh is already planned, skip.");
            return;
        }

        this.refreshPlanned = true;

        await this.render();
        console.info(`Refreshed ${this.id || this.tagName}`);

        this.refreshPlanned = false;
    }

    async refreshCascade(): Promise<void> {
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

    routeChanged(resolvedRoute: ResolvedRoute): void {
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

    private walkSelfNodes(handler: (node: Node) => boolean, elem: Node): void {
        for (let e of elem.childNodes) {
            if (handler(e)) {
                this.walkSelfNodes(handler, e);
            }
        }
    }

    private walkSelfElements(handler: (e: Element) => boolean, elem: Node): void {
        this.walkSelfNodes(n => {
            if (!(n instanceof Element)) {
                return true;
            }

            let e = n as Element;

            if (e.hasAttribute("weavergirl-slot")) {
                return false;
            }

            return handler(e);
        }, elem);
    }

    protected getSelfElementsByTagName(tagName: string): Array<Node> {
        let elems = [];

        this.walkSelfElements(e => {
            if (e.tagName.toUpperCase() === tagName.toUpperCase()) {
                elems.push(e);
            }

            return true;
        }, this);

        return elems;
    }

    protected get stageClass(): Stage {
        return null;
    }

    private walkSelfMutators(handler: (mutator: Mutator) => void, elem): void {
        let mutatorStack: Array<Mutator> = [];
        let mutators = [];

        this.walkSelfNodes(n => {
            if (n.nodeType === Node.COMMENT_NODE) {
                let s = n.textContent;

                if (s.startsWith(Component.mutatorBeginPattern)) {
                    s = s.substring(Component.mutatorBeginPattern.length);
                    let mutatorInfo = JSON.parse(s);

                    mutatorStack.push({
                        info: mutatorInfo,
                        parent: n.parentNode,
                        beginPatternNode: n,
                        beginIndex: Array.prototype.indexOf.call(n.parentNode.childNodes, n),
                        endPatternNode: null,
                        endIndex: -1,
                        childNodes: null
                    });
                } else if (s === Component.mutatorEndPattern) {
                    let mutator = mutatorStack.pop();

                    if (!mutator) {
                        console.dir(n);
                        throw new Error(`Unpaired mutator end pattern found at ${n}`);
                    }

                    mutator.endPatternNode = n;
                    mutator.endIndex = Array.prototype.indexOf.call(n.parentNode.childNodes, n);
                    mutator.childNodes = [];

                    for (let i = mutator.beginIndex + 1; i < mutator.endIndex; i++) {
                        mutator.childNodes.push(mutator.parent.childNodes[i]);
                    }

                    mutators.push(mutator);
                }
            } else if (n.nodeType === Node.ELEMENT_NODE) {
                for (let i = 0; i < n.attributes.length; i++) {
                    let a = n.attributes[i];

                    if (a.name.startsWith("weavergirl-mutator-")) {
                        let mutatorInfo = JSON.parse(decodeURIComponent(a.value));

                        mutators.push({
                            info: mutatorInfo,
                            parent: n,
                            beginPatternNode: null,
                            beginIndex: -1,
                            endPatternNode: null,
                            endIndex: -1,
                            childNodes: null
                        });
                    }
                }
            }

            return true;
        }, elem);

        for (let m of mutators) {
            handler(m);
        }
    }

    updateMutator(mutatorExpression: string, changeType: string, newValue: any): boolean {
        console.info(`Update mutators on ${this.id || this.tagName} with expression ${mutatorExpression} = ${newValue}, key/changeType ${changeType}`);

        let found = false;

        this.walkSelfMutators(mutator => {
            if (mutator.info.expression === mutatorExpression) {
                let f: Function;

                if (mutator.info.type === "attribute") {
                    f = Component.mutatorFunctions.get(mutator.info.id).bind(this);
                } else {
                    f = (mutator.beginPatternNode["_weavergirlMutatorFunction"] || Component.mutatorFunctions.get(mutator.info.id)).bind(this);
                }

                switch (mutator.info.type) {
                    case "inline":
                        if (mutator.childNodes.length > 0) {
                            mutator.childNodes[0].textContent = f();
                        } else {
                            let n = document.createTextNode(f());
                            mutator.parent.insertBefore(n, mutator.endPatternNode);
                        }

                        found = true;
                        break;
                    case "repeater":
                        let nodeCount = mutator.endIndex - mutator.beginIndex - 1;

                        for (let i = 0; i < nodeCount; i++) {
                            mutator.parent.removeChild(mutator.parent.childNodes[mutator.beginIndex + 1]);
                        }

                        let e = document.createElement("div");
                        e.innerHTML = f();

                        while (e.childNodes.length > 0) {
                            mutator.parent.insertBefore(e.childNodes[0], mutator.endPatternNode);
                        }

                        this.attachStageToSelfElements();

                        found = true;
                        break;
                    case "attribute":
                        let info = mutator.info as AttributeMutatorInfo;
                        (mutator.parent as Element).setAttribute(info.attribute, f());

                        found = true;
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

    static allocateMutatorId(): number {
        let n = Component.mutatorCounter;
        Component.mutatorCounter++;
        return n;
    }

    static setMutatorFunction(id: number, func: Function): void {
        Component.mutatorFunctions.set(id, func);
    }

    static collectUnusedMutatorId(elem: Node = document.body, _newMap = new Map<number, Function>()) {
        if (Component.mutatorFunctions.size <= 0) {
            console.info(`Mutator cache collection result: no need to collect.`);
            return;
        }

        let mutatorInfo: MutatorInfo = null;

        if ((elem instanceof Node) && (elem.nodeType == Node.COMMENT_NODE)) {
            let s = elem.textContent;

            if (s.startsWith(Component.mutatorBeginPattern)) {
                s = s.substring(Component.mutatorBeginPattern.length);
                mutatorInfo = JSON.parse(s) as MutatorInfo;
            }
        } else if (elem instanceof Element) {
            for (let i = 0; i < elem.attributes.length; i++) {
                let a = elem.attributes[i];

                if (a.name.startsWith("weavergirl-mutator-")) {
                    mutatorInfo = JSON.parse(a.value) as MutatorInfo;
                }
            }
        }

        if (mutatorInfo !== null) {
            if (Component.mutatorFunctions.has(mutatorInfo.id)) {
                _newMap.set(mutatorInfo.id, Component.mutatorFunctions.get(mutatorInfo.id));
            }
        }

        for (let c of elem.childNodes) {
            Component.collectUnusedMutatorId(c, _newMap);
        }

        if (elem === document.body) {
            console.info(`Mutator cache collection result: previous ${Component.mutatorFunctions.size}, now ${_newMap.size}, collected ${Component.mutatorFunctions.size - _newMap.size}`);

            Component.mutatorFunctions = _newMap;
        }
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