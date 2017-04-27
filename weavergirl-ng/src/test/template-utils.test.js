"use strict";

describe("TemplateUtils", () => {
    describe("#html", () => {
        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();
        });

        it("should generate correct simple HTML", () => {
            let s = T.html`<div>Hello</div>`;
            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct HTML with static value", () => {
            let n = 1;
            let s = T.html`<div>a: ${n}</div>`;
            s.should.equal("<div>a: 1</div>");
        });

        it("should generate inline mutator for dynamic value", () => {
            let n = 1;
            let s = T.html`<div>a: ${() => n}</div>`;
            s.should.equal(`<div>a: <!--#weavergirl-mutator {"id":0,"type":"inline","expression":"n"}-->1<!--#/weavergirl-mutator--></div>`);
        });

        it("should generate multiple inline mutators for the same dynamic value", () => {
            let n = 1;
            let s = T.html`<div>a: ${() => n}, b: ${() => n}</div>`;
            s.should.equal("<div>a: <!--#weavergirl-mutator {\"id\":0,\"type\":\"inline\",\"expression\":\"n\"}-->1<!--#/weavergirl-mutator-->" +
                ", b: <!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expression\":\"n\"}-->1<!--#/weavergirl-mutator--></div>");
        });

        it("should generate multiple inline mutators for two dynamic values", () => {
            let n = 1, m = 2;
            let s = T.html`<div>a: ${() => n}, b: ${() => m}</div>`;
            s.should.equal("<div>a: <!--#weavergirl-mutator {\"id\":0,\"type\":\"inline\",\"expression\":\"n\"}-->1<!--#/weavergirl-mutator-->" +
                ", b: <!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expression\":\"m\"}-->2<!--#/weavergirl-mutator--></div>");
        });
    });

    describe("#forEach", () => {
        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();
        });

        it("should generate correct simple static constant HTML", () => {
            let l = [1,2,3];

            let s = T.forEach(l, () => {
                return `<div>Hello</div>`;
            });

            s.should.equal("<div>Hello</div><div>Hello</div><div>Hello</div>");
        });

        it("should generate correct HTML for empty static list", () => {
            let l = [];

            let s = T.forEach(l, () => {
                return `<div>Hello</div>`;
            });

            s.should.equal("");
        });

        it("should generate correct HTML for static list with only one value", () => {
            let l = [1];

            let s = T.forEach(l, () => {
                return `<div>Hello</div>`;
            });

            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct HTML for static list", () => {
            let l = [1,2,3];

            let s = T.forEach(l, (m) => {
                return T.html`<div>Hello${m}</div>`;
            });

            s.should.equal("<div>Hello1</div><div>Hello2</div><div>Hello3</div>");
        });

        it("should generate mutators for the whole list and every item for dynamic list", () => {
            let l = [1,2,3];

            let s = T.forEach(() => l, (m) => {
                return T.html`<div>Hello${m}</div>`;
            });

            s.should.equal("<!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expression\":\"l.length\"}-->" +
                "<!--#weavergirl-mutator {\"id\":1,\"type\":\"repeater\",\"expression\":\"l[0]\"}--><div>Hello1</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":2,\"type\":\"repeater\",\"expression\":\"l[1]\"}--><div>Hello2</div><!--#/weavergirl-mutator-->" +
                "<!--#weavergirl-mutator {\"id\":3,\"type\":\"repeater\",\"expression\":\"l[2]\"}--><div>Hello3</div><!--#/weavergirl-mutator-->" +
                "<!--#/weavergirl-mutator-->");
        });
    });

    describe("#when", () => {
        beforeEach(() => {
            Weavergirl.MutatorHub.resetMutators();
        });

        it("should generate correct simple HTML for one positive branch", () => {
            let c = true;

            let s = T.when(c)
                .is(true, () => `<div>Hello</div>`)
                .toString();

            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct simple HTML for one negative branch", () => {
            let c = false;

            let s = T.when(c)
                .is(true, () => `<div>Hello</div>`)
                .toString();

            s.should.equal("");
        });

        it("should generate correct simple HTML for the positive in two branches", () => {
            let c = true;

            let s = T.when(c)
                .is(true, () => `<div>Hello</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<div>Hello</div>");
        });

        it("should generate correct simple HTML for the negative in two branches", () => {
            let c = false;

            let s = T.when(c)
                .is(true, () => `<div>Hello</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<div>World</div>");
        });

        it("should generate correct simple HTML for three branches", () => {
            let c = 2;

            let s = T.when(c)
                .is(1, () => `<div>Hello</div>`)
                .is(2, () => `<div>Whoa</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<div>Whoa</div>");
        });

        it("should generate mutators for branches", () => {
            let c = 2;

            let s = T.when(() => c)
                .is(1, () => `<div>Hello</div>`)
                .is(2, () => `<div>Whoa</div>`)
                .otherwise(() => `<div>World</div>`)
                .toString();

            s.should.equal("<!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expression\":\"c\"}--><div>Whoa</div><!--#/weavergirl-mutator-->");
        });
    });
});