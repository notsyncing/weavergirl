import Router from "./router/router";
import Component from "./component/component";
import TemplateUtils from "./component/template-utils";
import Loader from "./loader/loader";
import Stage from "./router/stage";
import {RouterCommand, RouterMode} from "./router/enums";

export let Weavergirl = {
    Loader: Loader,

    Component: Component,

    Router: new Router(),
    RouterMode: RouterMode,
    RouterCommand: RouterCommand,

    Stage: Stage,

    _tests: {}
};

if (!window["Weavergirl"]) {
    window["Weavergirl"] = Weavergirl;

    window["T"] = TemplateUtils;
}