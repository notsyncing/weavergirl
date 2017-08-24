import {RouterCommand} from "./enums";

export interface Route {
    route: string;
    component: string | RouteComponentInfo;
    parameters?: any;
    children?: Array<Route>;
    earlyInit?: boolean;
}

export interface RouteComponentInfo {
    url: string;
    id?: string;
}

export interface ResolvedRoute {
    url: string;
    commands: Array<RouteCommand>;
    queries: any;
}

export interface RouteCommand {
    command: RouterCommand;
    url?: string;
    componentId?: string;
    parameters?: any;
    rawRoute: Route;
}

export interface RouteMatchResult {
    parameters: any;
    remainPath: string;
}