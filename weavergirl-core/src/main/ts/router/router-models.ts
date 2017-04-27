import {RouterCommand} from "./enums";

export interface Route {
    route: string;
    component: string | RouteComponentInfo;
    children?: Array<Route>;
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
}

export interface RouteMatchResult {
    parameters: any;
    remainPath: string;
}