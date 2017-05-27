import "babel-polyfill";
import Router from "./router/router";
import Component from "./component/component";
import TemplateUtils from "./component/template-utils";
import Loader from "./loader/loader";
import Stage from "./router/stage";
import {RouterCommand, RouterMode} from "./router/enums";
import FunctionUtils from "./common/function-utils";
import {Language} from "./i18n/lang";
import MutatorHub from "./component/mutator-hub";
import {Http} from "./net/http";
import FormUtils from "./form/form-utils";
import FormValidation from "./form/form-validation";

export let Weavergirl = {
    Form: FormUtils,
    FormValidation: FormValidation,

    Loader: Loader,

    Component: Component,
    MutatorHub: MutatorHub,

    Router: new Router(),
    RouterMode: RouterMode,
    RouterCommand: RouterCommand,

    Stage: Stage,

    Language: Language,

    Http: Http,

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
    window["I"] = Language.getText;
}