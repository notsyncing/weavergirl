"use strict";

describe("Router", () => {
    describe("#resolve", () => {
        it("should resolve /simple", () => {
            Weavergirl.Router.init([
                {
                    route: "/simple",
                    component: "/test-module.js"
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/simple");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(1);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module.js");
        });

        it("should not match /simple to /simple2", () => {
            Weavergirl.Router.init([
                {
                    route: "/simple2",
                    component: "/test-module2.js"
                },
                {
                    route: "/simple",
                    component: "/test-module.js"
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/simple");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(1);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module.js");
        });

        it("should not match /simple2 to /simple", () => {
            Weavergirl.Router.init([
                {
                    route: "/simple",
                    component: "/test-module.js"
                },
                {
                    route: "/simple2",
                    component: "/test-module2.js"
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/simple2");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(1);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module2.js");
        });

        it("should resolve /deep/first", () => {
            Weavergirl.Router.init([
                {
                    route: "/deep",
                    component: "/deep.js",
                    children: [
                        {
                            route: "/first",
                            component: "/first.js"
                        }
                    ]
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/deep/first");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(2);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/deep.js");

            r[1].command.should.equal(Weavergirl.RouterCommand.Load);
            r[1].url.should.equal("/first.js");
        });

        it("should resolve catch-all layout", () => {
            Weavergirl.Router.init([
                {
                    route: "",
                    component: "/layout.js",
                    children: [
                        {
                            route: "/simple",
                            component: "/test-module.js"
                        }
                    ]
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/simple");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(2);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/layout.js");

            r[1].command.should.equal(Weavergirl.RouterCommand.Load);
            r[1].url.should.equal("/test-module.js");
        });

        it("should resolve multipart route /first/b", () => {
            Weavergirl.Router.init([
                {
                    route: "/",
                    component: "/layout.js",
                    children: [
                        {
                            route: "/first",
                            component: "/first.js",
                            children: [
                                {
                                    route: "/a",
                                    component: "/a.js"
                                }
                            ]
                        }
                    ]
                },
                {
                    route: "/first/b",
                    component: "/b.js"
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/first/b");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(1);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/b.js");
        });

        it("should not match route /second to / without children", () => {
            Weavergirl.Router.init([
                    {
                        route: "/",
                        component: "/first.js"
                    },
                    {
                        route: "/second",
                        component: "/second.js"
                    }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/second");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(1);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/second.js");
        });

        it("should resolve parametrized route /param/2", () => {
            Weavergirl.Router.init([
                {
                    route: "/param/:id",
                    component: "/test-module.js"
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/param/2");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(1);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module.js");
            should.exists(r[0].parameters.id);
            r[0].parameters.id.should.equal("2");
        });

        it("should resolve parametrized sub-route /param/2", () => {
            Weavergirl.Router.init([
                {
                    route: "/param",
                    component: "/test-module.js",
                    children: [
                        {
                            route: "/:id",
                            component: "/load.js"
                        }
                    ]
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/param/2");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(2);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module.js");
            should.not.exists(r[0].parameters.id);

            r[1].command.should.equal(Weavergirl.RouterCommand.Load);
            r[1].url.should.equal("/load.js");
            should.exists(r[1].parameters.id);
            r[1].parameters.id.should.equal("2");
        });

        it("should bind parameters to their definition routes", () => {
            Weavergirl.Router.init([
                {
                    route: "/param/:id",
                    component: "/test-module.js",
                    children: [
                        {
                            route: "/inner/:id",
                            component: "/load.js",
                        }
                    ]
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/param/2/inner/3");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(2);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module.js");
            should.exists(r[0].parameters.id);
            r[0].parameters.id.should.equal("2");

            r[1].command.should.equal(Weavergirl.RouterCommand.Load);
            r[1].url.should.equal("/load.js");
            should.exists(r[1].parameters.id);
            r[1].parameters.id.should.equal("3");
        });

        it("should match catch-all parameter in route", () => {
            Weavergirl.Router.init([
                {
                    route: "/param/*",
                    component: "/test-module.js",
                    children: [
                        {
                            route: "/inner",
                            component: "/inner.js"
                        }
                    ]
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/param/2/inner");
            should.exists(r);

            r = r.commands;
            r.length.should.equal(2);

            r[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r[0].url.should.equal("/test-module.js");

            r[1].command.should.equal(Weavergirl.RouterCommand.Load);
            r[1].url.should.equal("/inner.js");
        });

        it("should contain parameters in query string of route /simple?a=1&b=2", () => {
            Weavergirl.Router.init([
                {
                    route: "/simple",
                    component: "/test-module.js"
                }
            ], Weavergirl.RouterMode.Direct, true);

            let r = Weavergirl.Router.resolve("/simple", "a=1&b=2");
            should.exists(r);

            r.queries.a.should.equal("1");
            r.queries.b.should.equal("2");

            r.commands.length.should.equal(1);

            r.commands[0].command.should.equal(Weavergirl.RouterCommand.Load);
            r.commands[0].url.should.equal("/test-module.js");
        });
    });
});