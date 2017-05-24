"use strict";

describe("FunctionUtils", () => {
    describe("#extractExpressionFromFunction", () => {
        it("should return o.a for () => this.stage.state.o.a", () => {
            let f = () => this.stage.state.o.a;
            let r = Weavergirl._tests.FunctionUtils.extractExpressionFromFunction(f);
            r.should.equal("o.a");
        });

        it("should return o.a for () => { return this.stage.state.o.a; }", () => {
            let f = () => { return this.stage.state.o.a; };
            let r = Weavergirl._tests.FunctionUtils.extractExpressionFromFunction(f);
            r.should.equal("o.a");
        });

        it("should return o.a for function () { return this.stage.state.o.a; }", () => {
            let f = function () { return this.stage.state.o.a; };
            let r = Weavergirl._tests.FunctionUtils.extractExpressionFromFunction(f);
            r.should.equal("o.a");
        });

        it("should return o.a for () => this.stage.state./*b.*/o.a", () => {
            let f = () => this.stage.state./*b.*/o.a;
            let r = Weavergirl._tests.FunctionUtils.extractExpressionFromFunction(f);
            r.should.equal("o.a");
        });

        it("should return o.a for () => _this4.stage.state.o.a", () => {
            let f = () => _this4.stage.state.o.a;
            let r = Weavergirl._tests.FunctionUtils.extractExpressionFromFunction(f);
            r.should.equal("o.a");
        });

        it("should return o.a for () => this.stage.state.o.a()", () => {
            let f = () => this.stage.state.o.a;
            let r = Weavergirl._tests.FunctionUtils.extractExpressionFromFunction(f);
            r.should.equal("o.a");
        });
    });

    describe("#expandExpression", () => {
        it("should return an array with one element for a", () => {
            let expr = "a";
            let r = Weavergirl._tests.FunctionUtils.expandExpression(expr);
            r.should.eql(["a"]);
        });

        it("should return an array with three elements for a.b.c", () => {
            let expr = "a.b.c";
            let r = Weavergirl._tests.FunctionUtils.expandExpression(expr);
            r.should.eql(["a.b.c", "a.b", "a"]);
        });
    });

    describe("#getFunctionArguments", () => {
        it("should return [a, b, c] for (a, b, c) => something", () => {
            let f = (a, b, c) => something;
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "b", "c"]);
        });

        it("should return [a, c] for (a, /*b, */c) => something", () => {
            let f = (a, /*b, */c) => something;
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "c"]);
        });

        it("should return [a] for a => something", () => {
            let f = a => something;
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a"]);
        });

        it("should return [a] for (a) => something", () => {
            let f = (a) => something;
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a"]);
        });

        it("should return [a] for a => { return something; }", () => {
            let f = a => { return something; };
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a"]);
        });

        it("should return [a, b] for (a, b) =><CR>something<CR>", () => {
            let f = (a, b) =>
                something
            ;

            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "b"]);
        });

        it("should return [a, b] for (a, b) =><CR>{ return something;<CR>}", () => {
            let f = (a, b) => {
                return something;
            };

            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "b"]);
        });

        it("should return [a] for function (a) { return something; }", () => {
            let f = function (a) { return something; };
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a"]);
        });

        it("should return [a, b, c] for function (a, b, c) { return something; }", () => {
            let f = function (a, b, c) { return something; };
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "b", "c"]);
        });

        it("should return [a, c] for function (a, /*b, */c) { return something; }", () => {
            let f = function (a, /*b, */c) { return something; };
            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "c"]);
        });

        it("should return [a, b] for function (a, b) {<CR>return something;<CR>}", () => {
            let f = function (a, b) {
                return something;
            };

            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["a", "b"]);
        });

        it("should return [m, i] for complex function A", () => {
            let f = function (m, i) {
                return _this4.html(_templateObject, m.href, m.href, function () {
                    return _this4.stage.state.menus[i].name;
                });
            };

            let r = Weavergirl._tests.FunctionUtils.getFunctionArguments(f);
            r.should.eql(["m", "i"]);
        })
    });
});