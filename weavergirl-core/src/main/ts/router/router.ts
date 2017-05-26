import {RouterCommand, RouterMode} from "./enums";
import Loader from "../loader/loader";
import Component from "../component/component";
import {Weavergirl} from "../main";
import {ResolvedRoute, Route, RouteCommand, RouteComponentInfo, RouteMatchResult} from "./router-models";
import MutatorHub from "../component/mutator-hub";
import Stage from "./stage";

export default class Router {
    private routes: Array<Route> = [];
    private mode = RouterMode.Direct;

    static stages = new Map<string, Stage>();

    constructor() {
    }

    init(routes: Array<Route> = [], mode: RouterMode = RouterMode.Direct, _noGo = false): void {
        this.routes = routes;
        this.mode = mode;

        let route = this.resolve(this.getCurrentPath(), location.search);

        if (!_noGo) {
            this.go(route);
            history.replaceState(route, "", route.url);
        }
    }

    addRoute(route: Route, parentRoute: Route = null): void {
        if (parentRoute != null) {
            if (!parentRoute.children) {
                parentRoute.children = [];
            }

            parentRoute.children.push(route);
        } else {
            this.routes.push(route);
        }
    }

    getRoute(path: string): Route {
        if (path === "") {
            for (let r of this.routes) {
                if (r.route === "") {
                    return r;
                }
            }

            return null;
        }

        let resolvedRoute = this.resolve(path, "");

        if (resolvedRoute == null) {
            return null;
        }

        return resolvedRoute.commands[resolvedRoute.commands.length - 1].rawRoute;
    }

    private getCurrentPath(): string {
        switch (this.mode) {
            case RouterMode.Direct:
                return location.pathname;
            case RouterMode.QueryString:
                let qs = this.getQueryStringParameters(location.search);
                return qs["route"] || "/";
            default:
                throw new Error(`Unsupported router mode ${this.mode}`);
        }
    }

    private getQueryStringParameters(query: string): any {
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

    private matchPathWithRoute(path: string, route: Route): boolean | RouteMatchResult {
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

    private _resolve(currPath: string, currRoute: Route, prevResult: Array<RouteCommand>): Array<RouteCommand> {
        let _matchResult = this.matchPathWithRoute(currPath, currRoute);

        if (_matchResult === false) {
            return null;
        }

        let matchResult = _matchResult as RouteMatchResult;

        let componentUrl: string;
        let componentId: string = null;

        if (typeof currRoute.component === "string") {
            componentUrl = currRoute.component as string;
        } else {
            let c = currRoute.component as RouteComponentInfo;

            componentUrl = c.url;
            componentId = c.id;
        }

        prevResult.push({
            command: RouterCommand.Load,
            url: componentUrl,
            componentId: componentId,
            parameters: matchResult.parameters,
            rawRoute: currRoute
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

    resolve(path: string, queryString: string): ResolvedRoute {
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

    async go(resolvedRoute: ResolvedRoute, needToPushState = false): Promise<void> {
        if (!resolvedRoute) {
            throw new Error("No resolved route to go to!");
        }

        console.info(`Go to resolved route: ${JSON.stringify(resolvedRoute)}, need to push state ${needToPushState}`);

        let currLayout: Element = document.body;

        for (let cmd of resolvedRoute.commands) {
            switch (cmd.command) {
                case RouterCommand.Load:
                    let elemClass = await Loader.load(cmd.url);
                    let alreadyLoaded = null;

                    for (let child of currLayout.childNodes) {
                        if (child.constructor === elemClass) {
                            alreadyLoaded = child;
                            break;
                        }
                    }

                    if (!alreadyLoaded) {
                        let elem = new elemClass();

                        if (elem instanceof Component) {
                            Router.stages.set(elem.constructor.name, elem.stage);
                        }

                        if (cmd.componentId) {
                            elem.id = cmd.componentId;
                        }

                        elem.routeChanged(resolvedRoute, true);

                        if (currLayout instanceof Component) {
                            currLayout = (currLayout as Component).findSlotElement();
                        }

                        while (currLayout.firstChild) {
                            currLayout.removeChild(currLayout.firstChild);
                        }

                        currLayout.appendChild(elem);
                        currLayout = elem;
                    } else {
                        console.info(`Layout element ${alreadyLoaded.id || alreadyLoaded.tagName} already present on page, notify it.`);

                        currLayout = alreadyLoaded;

                        if (alreadyLoaded instanceof Component) {
                            alreadyLoaded.routeChanged(resolvedRoute);
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

        MutatorHub.collectUnusedMutatorId();
    }

    navigate(url: string, event: Event = null): Promise<void> {
        if (event) {
            event.preventDefault();
        }

        let elem = document.createElement("a");
        elem.href = url;

        let resolvedRoute = this.resolve(elem.pathname, elem.search);
        return this.go(resolvedRoute, true);
    }
}

window.onpopstate = function (event) {
    Weavergirl.Router.go(event.state, false);
};