import "babel-polyfill";
import Router from "./router/router";
import Component from "./component/component";
import TemplateUtils from "./component/template-utils";
import Loader from "./loader/loader";
import Stage from "./router/stage";
import {RouterCommand, RouterMode} from "./router/enums";
import {Language} from "./i18n/lang";
import MutatorHub from "./component/mutator-hub";
import {Http} from "./net/http";
import FormUtils from "./form/form-utils";
import FormValidation from "./form/form-validation";
import {RegexValidator} from "./form/validators/regex-validator";
import {NumberValidator} from "./form/validators/number-validator";
import {NumberRangeValidator} from "./form/validators/number-range-validator";
import {NotEmptyValidator} from "./form/validators/not-empty-validator";
import {MatchValidator} from "./form/validators/match-validator";
import {LengthValidator} from "./form/validators/length-validator";
import {IntegerValidator} from "./form/validators/integer-validator";

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
        }
    }
};

if (!window["Weavergirl"]) {
    window["Weavergirl"] = Weavergirl;

    window["T"] = (component: Component) => new TemplateUtils(component);
    window["I"] = Language.getText;

    FormValidation.addValidator(IntegerValidator);
    FormValidation.addValidator(LengthValidator);
    FormValidation.addValidator(MatchValidator);
    FormValidation.addValidator(NotEmptyValidator);
    FormValidation.addValidator(NumberRangeValidator);
    FormValidation.addValidator(NumberValidator);
    FormValidation.addValidator(RegexValidator);
}