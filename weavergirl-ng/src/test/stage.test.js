"use strict";

describe("Stage", () => {
    describe("-getFullExpression", () => {
        let newWatchedObject;
        let getFullExpression;
        let o, expr;

        beforeEach(() => {
            newWatchedObject = Weavergirl._tests.Stage.newWatchedObject;
            getFullExpression = Weavergirl._tests.Stage.getFullExpression;

            o = newWatchedObject({
                set: function (target, key, value) {
                    expr = getFullExpression(target, key);
                }
            });
        });

        it("should return 'a' for o.a = 1", () => {
            o.a = 1;
            expr.should.equal("a");
        });

        it("should return 'a.b' for o.a.b = 1", () => {
            o.a = {};
            o.a.b = 1;
            expr.should.equal("a.b");
        });

        it("should return 'a.b.c' for o.a.b.c = 1", () => {
            o.a = { b: {} };
            o.a.b.c = 1;
            expr.should.equal("a.b.c");
        });

        it("should return 'a[0]' for o.a[0] = 1", () => {
            o.a = [];
            o.a[0] = 1;
            expr.should.equal("a[0]");
        });

        it("should return 'a[0].b' for o.a[0].b = 1", () => {
            o.a = [{}];
            o.a[0].b = 1;
            expr.should.equal("a[0].b");
        });

        it("should return 'a[0][0].b' for o.a[0][0].b = 1", () => {
            o.a = [[{}]];
            o.a[0][0].b = 1;
            expr.should.equal("a[0][0].b");
        });

        it("should return 'a[0][0].b.c[0].d' for o.a[0][0].b.c[0].d = 1", () => {
            o.a = [[{ b: { c: [{}] } }]];
            o.a[0][0].b.c[0].d = 1;
            expr.should.equal("a[0][0].b.c[0].d");
        });

        it("should return 'a.length' for o.a.push(1)", () => {
            o.a = [];
            o.a.push(1);
            expr.should.equal("a.length");
        });
    });
});