"use strict";

class TestComponent extends Weavergirl.Component {
    get stageClass() {
        return TestComponentStage;
    }
}

class TestComponentStage extends Weavergirl.Stage {
    init() {
        super.init();

        this.state = {

        };
    }
}

customElements.define("test-component", TestComponent);

describe("TemplateUtils", () => {
    describe("#html", () => {
        let tc;

        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();
            
            tc = new TestComponent();
        });

        it("should generate correct simple HTML", () => {
            let s = T(tc).html`<div>Hello</div>`;
            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct HTML with static value", () => {
            tc.stage.state.n = 1;
            let s = T(tc).html`<div>a: ${tc.stage.state.n}</div>`;
            s.should.equal("<div>a: 1</div>");
        });

        it("should generate inline mutator for dynamic value", () => {
            tc.stage.state.n = 1;
            let s = T(tc).html`<div>a: ${() => tc.stage.state.n}</div>`;
            s.should.equal(`<div>a: <!--#weavergirl-mutator {"id":0,"type":"inline","expressions":["n"]}-->1<!--#/weavergirl-mutator--></div>`);
        });

        it("should generate multiple inline mutators for the same dynamic value", () => {
            tc.stage.state.n = 1;
            let s = T(tc).html`<div>a: ${() => tc.stage.state.n}, b: ${() => tc.stage.state.n}</div>`;
            s.should.equal("<div>a: <!--#weavergirl-mutator {\"id\":0,\"type\":\"inline\",\"expressions\":[\"n\"]}-->1<!--#/weavergirl-mutator-->" +
                ", b: <!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expressions\":[\"n\"]}-->1<!--#/weavergirl-mutator--></div>");
        });

        it("should generate multiple inline mutators for two dynamic values", () => {
            tc.stage.state.n = 1;
            tc.stage.state.m = 2;
            let s = T(tc).html`<div>a: ${() => tc.stage.state.n}, b: ${() => tc.stage.state.m}</div>`;
            s.should.equal("<div>a: <!--#weavergirl-mutator {\"id\":0,\"type\":\"inline\",\"expressions\":[\"n\"]}-->1<!--#/weavergirl-mutator-->" +
                ", b: <!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expressions\":[\"m\"]}-->2<!--#/weavergirl-mutator--></div>");
        });
    });

    describe("#forEach", () => {
        let tc;

        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();

            tc = new TestComponent();
        });

        it("should generate correct simple static constant HTML", () => {
            let l = [1,2,3];

            let s = T(tc).forEach(l, () => {
                return `<div>Hello</div>`;
            });

            s.should.equal("<div>Hello</div><div>Hello</div><div>Hello</div>");
        });

        it("should generate correct HTML for empty static list", () => {
            let l = [];

            let s = T(tc).forEach(l, () => {
                return `<div>Hello</div>`;
            });

            s.should.equal("");
        });

        it("should generate correct HTML for static list with only one value", () => {
            let l = [1];

            let s = T(tc).forEach(l, () => {
                return `<div>Hello</div>`;
            });

            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct HTML for static list", () => {
            let l = [1,2,3];

            let s = T(tc).forEach(l, (m) => {
                return T(tc).html`<div>Hello${m}</div>`;
            });

            s.should.equal("<div>Hello1</div><div>Hello2</div><div>Hello3</div>");
        });

        it("should generate mutators for the whole list and every item for dynamic list", () => {
            tc.stage.state.l = [1,2,3];

            let s = T(tc).forEach(() => tc.stage.state.l, (m) => {
                return T(tc).html`<div>Hello${m}</div>`;
            });

            s.should.equal("<!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expressions\":[\"l\",\"l.length\"]}-->" +
                "<!--#weavergirl-mutator {\"id\":1,\"type\":\"repeater\",\"expressions\":[\"l[0]\"]}--><div>Hello1</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":2,\"type\":\"repeater\",\"expressions\":[\"l[1]\"]}--><div>Hello2</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":3,\"type\":\"repeater\",\"expressions\":[\"l[2]\"]}--><div>Hello3</div><!--#/weavergirl-mutator-->" +
                "<!--#/weavergirl-mutator-->");
        });

        it("should replace index variables for every item for dynamic list", () => {
            tc.stage.state.l = [1,2,3];

            let s = T(tc).forEach(() => tc.stage.state.l, (m, i) => {
                return T(tc).html`<div>Hello${() => tc.stage.state.l[i]}</div>`;
            });

            s.should.equal("<!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expressions\":[\"l\",\"l.length\"]}-->" +
                "<!--#weavergirl-mutator {\"id\":2,\"type\":\"repeater\",\"expressions\":[\"l[0]\"]}-->" +
                "<div>Hello<!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expressions\":[\"l\",\"l[0]\"]}-->1<!--#/weavergirl-mutator-->" +
                "</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":4,\"type\":\"repeater\",\"expressions\":[\"l[1]\"]}-->" +
                "<div>Hello<!--#weavergirl-mutator {\"id\":3,\"type\":\"inline\",\"expressions\":[\"l\",\"l[1]\"]}-->2<!--#/weavergirl-mutator-->" +
                "</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":6,\"type\":\"repeater\",\"expressions\":[\"l[2]\"]}-->" +
                "<div>Hello<!--#weavergirl-mutator {\"id\":5,\"type\":\"inline\",\"expressions\":[\"l\",\"l[2]\"]}-->3<!--#/weavergirl-mutator-->" +
                "</div><!--#/weavergirl-mutator-->" +
                "<!--#/weavergirl-mutator-->");
        });

        it("should replace item variables for every item for dynamic list", () => {
            tc.stage.state.l = [{ v: 1 }, { v: 2 }, { v: 3 }];

            let s = T(tc).forEach(() => tc.stage.state.l, (m) => {
                return T(tc).html`<div>Hello${() => m.v}</div>`;
            });

            s.should.equal("<!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expressions\":[\"l\",\"l.length\"]}-->" +
                "<!--#weavergirl-mutator {\"id\":2,\"type\":\"repeater\",\"expressions\":[\"l[0]\"]}-->" +
                "<div>Hello<!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expressions\":[\"l[0].v\"]}-->1<!--#/weavergirl-mutator-->" +
                "</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":4,\"type\":\"repeater\",\"expressions\":[\"l[1]\"]}-->" +
                "<div>Hello<!--#weavergirl-mutator {\"id\":3,\"type\":\"inline\",\"expressions\":[\"l[1].v\"]}-->2<!--#/weavergirl-mutator-->" +
                "</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":6,\"type\":\"repeater\",\"expressions\":[\"l[2]\"]}-->" +
                "<div>Hello<!--#weavergirl-mutator {\"id\":5,\"type\":\"inline\",\"expressions\":[\"l[2].v\"]}-->3<!--#/weavergirl-mutator-->" +
                "</div><!--#/weavergirl-mutator-->" +
                "<!--#/weavergirl-mutator-->");
        });
    });

    describe("#when", () => {
        let tc;

        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();

            tc = new TestComponent();
        });

        it("should generate correct simple HTML for one positive branch", () => {
            tc.stage.state.c = true;

            let s = T(tc).when(tc.stage.state.c)
                .is(true, () => `<div>Hello</div>`)
                .toString();

            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct simple HTML for one negative branch", () => {
            tc.stage.state.c = false;

            let s = T(tc).when(tc.stage.state.c)
                .is(true, () => `<div>Hello</div>`)
                .toString();

            s.should.equal("");
        });

        it("should generate correct simple HTML for the positive in two branches", () => {
            tc.stage.state.c = true;

            let s = T(tc).when(tc.stage.state.c)
                .is(true, () => `<div>Hello</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct simple HTML for the negative in two branches", () => {
            tc.stage.state.c = false;

            let s = T(tc).when(tc.stage.state.c)
                .is(true, () => `<div>Hello</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<div>World</div>");
        });

        it("should generate correct simple HTML for three branches", () => {
            tc.stage.state.c = 2;

            let s = T(tc).when(tc.stage.state.c)
                .is(1, () => `<div>Hello</div>`)
                .is(2, () => `<div>Whoa</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<div>Whoa</div>");
        });

        it("should generate mutators for branches", () => {
            tc.stage.state.c = 2;

            let s = T(tc).when(() => tc.stage.state.c)
                .is(1, () => `<div>Hello</div>`)
                .is(2, () => `<div>Whoa</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expressions\":[\"c\"]}--><div>Whoa</div><!--#/weavergirl-mutator-->");
        });
    });

    describe("#attr", () => {
        let tc;

        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();

            tc = new TestComponent();
        });

        it("should generate correct static attribute for element", () => {
            let c = 2;

            let s = T(tc).attr("value", c);

            s.should.equal("value=\"2\"");
        });

        it("should generate correct dynamic attribute for element", () => {
            tc.stage.state.c = 2;

            let s = T(tc).attr("value", () => tc.stage.state.c);

            s.should.equal("value=\"2\" weavergirl-mutator-0=\"{%22id%22:0,%22type%22:%22attribute%22,%22expressions%22:[%22c%22],%22attribute%22:%22value%22}\"");
        });

        it("should skip this attribute when value is undefined", () => {
            let s = T(tc).attr("value", () => tc.stage.state.d);

            s.should.equal(" weavergirl-mutator-0=\"{%22id%22:0,%22type%22:%22attribute%22,%22expressions%22:[%22d%22],%22attribute%22:%22value%22}\"");
        })
    });

    describe("#bind", () => {
        let tc;

        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();

            tc = new TestComponent();
        });

        it("should generate correct bind attribute for element", () => {
            tc.stage.state.c = 0;
            let s = T(tc).bind(() => tc.stage.state.c);

            s.should.equal("data-weavergirl-bind-mutator=\"{%22id%22:0,%22type%22:%22delegate%22,%22expressions%22:[%22c%22],%22delegate%22:%22this.bindMutatorHandler%22}\"");
        });
    });
});