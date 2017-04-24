import "babel-polyfill";
import Router from "./router/router";
import Component from "./component/component";
import TemplateUtils from "./component/template-utils";
import Loader from "./loader/loader";
import Stage from "./router/stage";
import {RouterCommand, RouterMode} from "./router/enums";
import FunctionUtils from "./common/function-utils";

export let Weavergirl = {
    Loader: Loader,

    Component: Component,

    Router: new Router(),
    RouterMode: RouterMode,
    RouterCommand: RouterCommand,

    Stage: Stage,

    _tests: {
        Stage: {
            newWatchedObject: Stage.newWatchedObject,
            getFullExpression: Stage.getFullExpression
        },
        FunctionUtils: FunctionUtils
    }
};

if (!window["Weavergirl"]) {
    window["Weavergirl"] = Weavergirl;

    window["T"] = TemplateUtils;
}