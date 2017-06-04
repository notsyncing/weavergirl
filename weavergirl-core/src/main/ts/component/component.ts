import TemplateUtils from "./template-utils";
import Loader from "../loader/loader";
import {ComponentDependencies} from "./component-dependencies";
import Stage from "../router/stage";
import {AttributeMutatorInfo, DelegateMutatorInfo, Mutator} from "./mutator";
import {ResolvedRoute} from "../router/router-models";
import MutatorHub from "./mutator-hub";
import Router from "../router/router";

export default class Component extends HTMLElement {
    static stylesheets = new Set<string>();
    static fragments = new Map<string, string>();

    private content: string = "";
    private route = null;
    private _stage: Stage = null;

    private allDependenciesLoaded = false;
    private refreshPlanned = false;
    private rendered = false;

    public noRefreshOnRouteChanged = false;

    constructor(private contentUrl: string,
                private stylesheetUrls: Array<string> = null,
                private scriptUrls: Array<string> = null) {
        super();

        console.info(`Constructor: contentUrl ${contentUrl}`);

        if (this.stageClass) {
            if (Router.stages.has(this.constructor.name)) {
                this._stage = Router.stages.get(this.constructor.name);
            } else {
                let c = this.stageClass as any;
                this._stage = new c(this);
            }
        } else {
            this._stage = new Stage(this);
        }

        this._stage.rootComponent = this;

        this.init();
    }

    protected init() {

    }

    set stage(stage: Stage) {
        this._stage = stage;
        this._stage.rootComponent = this;
    }

    get stage(): Stage {
        return this._stage;
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
                if (typeof url === "object") {
                    let u: any = url;
                    await Loader.load(u.url, u.global);
                } else {
                    await Loader.load(url);
                }
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

    private attachStageToSelfElements(inNode: Node = this): void {
        this.walkSelfElements(elem => {
            if (!(elem instanceof Component)) {
                elem["stage"] = this._stage;
            }

            return true;
        }, inNode);
    }

    async render(): Promise<void> {
        if (!this.ownerDocument.defaultView) {
            console.info(`${this.id || this.tagName} has not been inserted into DOM, skip rendering.`);
            return;
        }

        await this.loadDependencies();

        let r = this.getRenderedContent();
        let renderedContent;

        if (r instanceof Promise) {
            renderedContent = await r;
        } else {
            renderedContent = r;
        }

        this.attachRenderedContentToDom(renderedContent);
        this.attachElementsToProperties();
        this.attachStageToSelfElements();

        if ((this._stage) && (this._stage.rootComponent === this)) {
            this._stage.rootComponentRendered();
        }

        setTimeout(() => {
            this.afterRender();

            if ((this._stage) && (this._stage.rootComponent === this)) {
                this._stage.stageDidEnter();
            }
        }, 0);
    }

    protected afterRender(): void {}

    connectedCallback() {
        console.info(`Attached ${this.id || this.tagName} to DOM, contentUrl ${this.contentUrl}, stage ${this._stage.constructor.name}`);
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
        let attachToStage = (this._stage) && (this._stage.rootComponent === this);

        function _process(elem) {
            if (!(elem instanceof Element)) {
                return;
            }

            let id = null;

            if (elem.hasAttribute("data-weavergirl-id")) {
                id = elem.getAttribute("data-weavergirl-id");
            } else if (elem.hasAttribute("weavergirl-keep-id")) {
                id = elem.id;
            }

            if (id != null) {
                __this[id] = elem;

                if (attachToStage) {
                    __this._stage[id] = elem;
                }
            }

            for (let c of elem.childNodes) {
                _process(c);
            }
        }

        _process(this);
    }

    private registerSelfMutators(inNode: Node = this): void {
        this.walkSelfMutators(m => {
            this._stage.mutatorHub.registerMutator(m);

            if (MutatorHub.mutatorFunctions.has(m.info.id)) {
                if ((m.info.type !== "attribute") && (m.info.type !== "delegate")) {
                    m.beginPatternNode["_weavergirlMutatorFunction"] = MutatorHub.mutatorFunctions.get(m.info.id);
                    MutatorHub.mutatorFunctions.delete(m.info.id);
                }
            }

            if (m.info.type === "delegate") {
                this.processBindMutator(m);
            }
        }, inNode);
    }

    private bindMutatorHandler(elem, newValue) {
        if (elem["__weavergirlBindSetInProgress"] === true) {
            return;
        }

        console.info(`Bind mutator handler for ${elem.id || elem.tagName}, new value ${newValue}`);

        if (elem instanceof HTMLInputElement) {
            if ((elem.type === "checkbox") || (elem.type === "radio")) {
                elem.checked = newValue;
            } else if (elem.type !== "file") {
                elem.value = newValue;
            }
        } else if (elem instanceof HTMLTextAreaElement) {
            elem.value = newValue;
        }
    }

    private processBindMutator(m: Mutator): void {
        let e = m.parent as Element;

        if (!e.hasAttribute("data-weavergirl-bind-mutator")) {
            return;
        }

        if (!((e instanceof HTMLInputElement) || (e instanceof HTMLTextAreaElement))) {
            return;
        }

        let bindTo = m.info.expressions[0];
        let writeFn = new Function("value", `this.stage.state.${bindTo} = value;`).bind(this);
        let readFn = new Function(`return this.stage.state.${bindTo};`).bind(this);

        let eventHandler = function (event) {
            e["__weavergirlBindSetInProgress"] = true;

            if (e instanceof HTMLInputElement) {
                if ((e.type === "checkbox") || (e.type === "radio")) {
                    writeFn(e.checked);
                } else if (e.type !== "file") {
                    writeFn(e.value);
                }
            } else if (e instanceof HTMLTextAreaElement) {
                writeFn(e.value);
            }

            e["__weavergirlBindSetInProgress"] = false;
        };

        if (e instanceof HTMLInputElement) {
            if ((e.type === "checkbox") || (e.type === "radio")) {
                e.addEventListener("click", eventHandler);
                e.checked = readFn();
            } else if (e.type !== "file") {
                e.addEventListener("input", eventHandler);
                e.value = readFn();
            }
        } else if (e instanceof HTMLTextAreaElement) {
            e.addEventListener("input", eventHandler);
            e.value = readFn();
        }

        console.info(`Processed bind mutator id ${m.info.id}, for element ${(m.parent as Element).id || (m.parent as Element).tagName}`)
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

        this.registerSelfMutators();

        this.rendered = true;
    }

    private getRenderedContent(): any {
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

    routeChanged(resolvedRoute: ResolvedRoute, noRefresh: boolean = false): void {
        let params = resolvedRoute.queries || {};

        for (let c of resolvedRoute.commands) {
            for (let p of Object.keys(c.parameters)) {
                params[p] = c.parameters[p];
            }
        }

        this.route = {
            url: resolvedRoute.url,
            parameters: params
        };

        if ((this._stage) && (this._stage.rootComponent === this)) {
            this._stage.stageWillEnter();
        }

        if ((!this.noRefreshOnRouteChanged) && (!noRefresh)) {
            console.info(`Component ${this.id || this.tagName} needs to be refreshed on route change, refresh it.`);
            this.refresh();
        }

        this.onRouteChanged(this.route);
    }

    protected onRouteChanged(route): void {}

    getRoute(): any {
        return this.route;
    }

    private walkChildNodes(handler: (node: Node) => boolean, elem: Node): void {
        for (let e of elem.childNodes) {
            if (handler(e)) {
                this.walkChildNodes(handler, e);
            }
        }
    }

    private walkSelfElements(handler: (e: Element) => boolean, elem: Node): void {
        this.walkChildNodes(n => {
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

    private walkSelfMutators(handler: (mutator: Mutator) => void, elem: Node): void {
        let mutatorStack: Array<Mutator> = [];
        let mutators = [];

        this.walkChildNodes(n => {
            this._stage.handleMutatorNode(n, mutatorStack, m => mutators.push(m));
            return true;
        }, elem);

        for (let m of mutators) {
            handler(m);
        }
    }

    private processMutator(mutator: Mutator): void {
        let f: Function;

        if ((mutator.info.type === "attribute") || (mutator.info.type === "delegate")) {
            f = MutatorHub.mutatorFunctions.get(mutator.info.id).bind(this);
        } else {
            f = (mutator.beginPatternNode["_weavergirlMutatorFunction"] || MutatorHub.mutatorFunctions.get(mutator.info.id)).bind(this);
        }

        let mutatorBeginIndex = Array.prototype.indexOf.call(mutator.parent.childNodes, mutator.beginPatternNode);
        let mutatorEndIndex = Array.prototype.indexOf.call(mutator.parent.childNodes, mutator.endPatternNode);

        switch (mutator.info.type) {
            case "inline":
                if (mutatorEndIndex - mutatorBeginIndex - 1 > 0) {
                    mutator.parent.childNodes.item(mutatorEndIndex - 1).textContent = f();
                } else {
                    let n = document.createTextNode(f());
                    mutator.parent.insertBefore(n, mutator.endPatternNode);
                    mutatorEndIndex++;
                }

                break;
            case "repeater":
                let nodeCount = mutatorEndIndex - mutatorBeginIndex - 1;

                for (let i = 0; i < nodeCount; i++) {
                    mutator.parent.removeChild(mutator.parent.childNodes[mutatorBeginIndex + 1]);
                }

                let e = document.createElement("template");
                e.innerHTML = f();
                let content = document.importNode(e.content, true);

                while (content.childNodes.length > 0) {
                    mutator.parent.insertBefore(content.childNodes[0], mutator.endPatternNode);
                }

                mutatorEndIndex = Array.prototype.indexOf.call(content.childNodes, mutator.endPatternNode);

                this.attachStageToSelfElements(mutator.parent);
                this.registerSelfMutators(mutator.parent);

                break;
            case "attribute":
                let attrInfo = mutator.info as AttributeMutatorInfo;
                (mutator.parent as Element).setAttribute(attrInfo.attribute, f());

                break;
            case "delegate":
                let delegateInfo = mutator.info as DelegateMutatorInfo;

                if (typeof delegateInfo.delegate === "function") {
                    (delegateInfo.delegate as Function).call(this, mutator.parent as Element, f());
                } else {
                    let delegate = eval(delegateInfo.delegate as string) as Function;
                    delegate.call(this, mutator.parent as Element, f());
                }

                break;
            default:
                throw new Error(`Unsupported mutator type ${mutator.info.type}, mutator ${JSON.stringify(mutator.info)}`);
        }
    }

    private static ifNodeAttachedToDom(node: Node): boolean {
        while ((node !== document) && (node.parentNode)) {
            node = node.parentNode;
        }

        return node === document;
    }

    updateMutator(mutatorExpression: string, changeType: string, newValue: any): boolean {
        console.info(`Update mutators on ${this.id || this.tagName} with expression ${mutatorExpression} = ${newValue}, key/changeType ${changeType}`);

        let found = 0;

        let mutators = this._stage.mutatorHub.getMutatorsByExpression(mutatorExpression);

        if (mutators) {
            let mutatorsToRemove: Array<Mutator> = [];

            for (let mutator of mutators) {
                if ((mutator.info.type !== "attribute") && (mutator.info.type !== "delegate")) {
                    if (!Component.ifNodeAttachedToDom(mutator.beginPatternNode)) {
                        mutatorsToRemove.push(mutator);
                        continue;
                    }
                }

                found = 1;
                this.processMutator(mutator);
            }

            if (mutatorsToRemove.length > 0) {
                for (let m of mutatorsToRemove) {
                    let i = mutators.indexOf(m);
                    mutators.splice(i, 1);
                }

                if (mutators.length <= 0) {
                    this._stage.mutatorHub.deleteMutatorsByExpression(mutatorExpression);
                }

                console.info(`Collected ${mutatorsToRemove.length} detached mutators.`);
            }
        } else {
            this.walkSelfMutators(mutator => {
                if (mutator.info.expressions.indexOf(mutatorExpression) >= 0) {
                    found = 2;
                    this.processMutator(mutator);
                }
            }, this);
        }

        if (found === 1) {
            console.info(`Found matching mutators directly.`);
        } else if (found === 2) {
            console.info(`Found matching mutators by visiting.`);
        } else {
            console.info(`No matching mutator found.`);
        }

        return found > 0;
    }
}

Loader.addAfterLoadHandler(function (exports) {
    if (!exports) {
        return;
    }

    if (Component.isPrototypeOf(exports)) {
        let name = exports.defineTagName || exports.name.replace(/(?:^|\.?)([A-Z])/g, (x, y) => "-" + y.toLowerCase()).replace(/^-/, "");
        customElements.define(name, exports);
    }
});