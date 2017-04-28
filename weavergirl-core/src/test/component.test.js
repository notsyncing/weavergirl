describe("Component", () => {
    class ComponentTester {
        constructor() {
            this.container = document.createElement("div");
            document.body.appendChild(this.container);
        }

        define(tagName, componentClass) {
            customElements.define(tagName, componentClass);
        }

        render(data) {
            this.container.innerHTML = data;

            return this.container.childNodes[0];
        }

        renderSimple(componentClass) {
            let name = componentClass.name.replace(/(?:^|\.?)([A-Z])/g, (x, y) => "-" + y.toLowerCase()).replace(/^-/, "");
            customElements.define(name, componentClass);

            return this.render(`<${name}></${name}>`);
        }

        get content() {
            return this.container.innerHTML;
        }

        destroy() {
            document.body.removeChild(this.container);
        }
    }

    let tester;

    beforeEach(() => {
        Weavergirl.MutatorHub.resetMutators();

        tester = new ComponentTester();
    });

    afterEach(() => {
        tester.destroy();
    });

    it("should correctly render a simple static component", (done) => {
        class TestStaticComponent extends Weavergirl.Component {
            view() {
                return `<div>Test</div>`;
            }
        }

        tester.renderSimple(TestStaticComponent);

        setTimeout(() => {
            let r = tester.content;
            r.should.equal("<test-static-component><div>Test</div></test-static-component>");

            done();
        }, 0);
    });

    it("should correctly render a simple immutable inline one-state component", (done) => {
        class TestOneStateImmutableComponentStage extends Weavergirl.Stage {
            init() {
                this.state.text = "Hello!";
            }
        }

        class TestOneStateImmutableComponent extends Weavergirl.Component {
            get stageClass() {
                return TestOneStateImmutableComponentStage;
            }

            view() {
                console.dir(this.stage.state);
                return `<div>Test: ${this.stage.state.text}</div>`;
            }
        }

        tester.renderSimple(TestOneStateImmutableComponent);

        setTimeout(() => {
            let r = tester.content;
            r.should.equal("<test-one-state-immutable-component>" +
                "<div>Test: " +
                "Hello!" +
                "</div>" +
                "</test-one-state-immutable-component>");

            done();
        }, 0);
    });

    it("should correctly render a simple mutable inline one-state component", (done) => {
        class TestOneStateMutableComponentStage extends Weavergirl.Stage {
            init() {
                this.state.text = "Hello!";
            }
        }

        class TestOneStateMutableComponent extends Weavergirl.Component {
            get stageClass() {
                return TestOneStateMutableComponentStage;
            }

            view() {
                return this.html`<div>Test: ${() => this.stage.state.text}</div>`;
            }
        }

        tester.renderSimple(TestOneStateMutableComponent);

        setTimeout(() => {
            let r = tester.content;
            r.should.equal("<test-one-state-mutable-component>" +
                "<div>Test: " +
                "<!--#weavergirl-mutator {\"id\":0,\"type\":\"inline\",\"expressions\":[\"text\"]}-->" +
                "Hello!" +
                "<!--#/weavergirl-mutator-->" +
                "</div>" +
                "</test-one-state-mutable-component>");

            done();
        }, 0);
    });

    it("should change a simple inline mutator and re-render when state changed", (done) => {
        class TestOneStateComponentStage2 extends Weavergirl.Stage {
            init() {
                this.state.text = "Hello!";
            }
        }

        class TestOneStateComponent2 extends Weavergirl.Component {
            get stageClass() {
                return TestOneStateComponentStage2;
            }

            view() {
                return this.html`<div>Test: ${() => this.stage.state.text}</div>`;
            }
        }

        let elem = tester.renderSimple(TestOneStateComponent2);

        let expected = "<test-one-state-component2>" +
            "<div>Test: " +
            "<!--#weavergirl-mutator {\"id\":0,\"type\":\"inline\",\"expressions\":[\"text\"]}-->" +
            "World!" +
            "<!--#/weavergirl-mutator-->" +
            "</div>" +
            "</test-one-state-component2>";

        setTimeout(() => {
            tester.content.should.not.equal(expected);

            elem.stage.state.text = "World!";

            setTimeout(() => {
                tester.content.should.equal(expected);

                done();
            }, 0);
        }, 0);
    });

    it("should correctly render a simple immutable repeater component", (done) => {
        class TestImmutableRepeaterComponentStage extends Weavergirl.Stage {
            init() {
                this.state.list = [ 1, 2, 3 ];
            }
        }

        class TestImmutableRepeaterComponent extends Weavergirl.Component {
            get stageClass() {
                return TestImmutableRepeaterComponentStage;
            }

            view() {
                console.dir(this.stage.state);
                return this.html`<div>${T.forEach(this.stage.state.list, (m, i) => `<div>${m}</div>`)}</div>`;
            }
        }

        tester.renderSimple(TestImmutableRepeaterComponent);

        setTimeout(() => {
            let r = tester.content;
            r.should.equal("<test-immutable-repeater-component>" +
                "<div>" +
                "<div>1</div>" +
                "<div>2</div>" +
                "<div>3</div>" +
                "</div>" +
                "</test-immutable-repeater-component>");

            done();
        }, 0);
    });

    it("should change an item in a repeater component when state changed", (done) => {
        class TestMutableItemRepeaterComponentStage extends Weavergirl.Stage {
            init() {
                this.state.list = [
                    {
                        name: "1"
                    },
                    {
                        name: "2"
                    },
                    {
                        name: "3"
                    }
                ];
            }
        }

        class TestMutableItemRepeaterComponent extends Weavergirl.Component {
            get stageClass() {
                return TestMutableItemRepeaterComponentStage;
            }

            view() {
                console.dir(this.stage.state);
                return this.html`<div>${T.forEach(() => this.stage.state.list, 
                    (m, i) => this.html`<div>${() => this.stage.state.list[i].name}</div>`)}</div>`;
            }
        }

        let elem = tester.renderSimple(TestMutableItemRepeaterComponent);

        let expected = "<test-mutable-item-repeater-component>" +
            "<div><!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expressions\":[\"list.length\"]}-->" +
            "<!--#weavergirl-mutator {\"id\":2,\"type\":\"repeater\",\"expressions\":[\"list[0]\"]}--><div>" +
            "<!--#weavergirl-mutator {\"id\":1,\"type\":\"inline\",\"expressions\":[\"list[0].name\"]}-->1<!--#/weavergirl-mutator-->" +
            "</div><!--#/weavergirl-mutator-->" +
            "<!--#weavergirl-mutator {\"id\":4,\"type\":\"repeater\",\"expressions\":[\"list[1]\"]}--><div>" +
            "<!--#weavergirl-mutator {\"id\":3,\"type\":\"inline\",\"expressions\":[\"list[1].name\"]}-->4<!--#/weavergirl-mutator-->" +
            "</div><!--#/weavergirl-mutator-->" +
            "<!--#weavergirl-mutator {\"id\":6,\"type\":\"repeater\",\"expressions\":[\"list[2]\"]}--><div>" +
            "<!--#weavergirl-mutator {\"id\":5,\"type\":\"inline\",\"expressions\":[\"list[2].name\"]}-->3<!--#/weavergirl-mutator-->" +
            "</div><!--#/weavergirl-mutator-->" +
            "<!--#/weavergirl-mutator--></div>" +
            "</test-mutable-item-repeater-component>";

        setTimeout(() => {
            let r = tester.content;
            r.should.not.equal(expected);

            elem.stage.state.list[1].name = "4";

            setTimeout(() => {
                tester.content.should.equal(expected);

                done();
            }, 0);
        }, 0);
    });

    it("should correctly render a simple conditional immutable repeater component", (done) => {
        class TestImmutableConditionalRepeaterComponentStage extends Weavergirl.Stage {
            init() {
                this.state.show = false;
            }
        }

        class TestImmutableConditionalRepeaterComponent extends Weavergirl.Component {
            get stageClass() {
                return TestImmutableConditionalRepeaterComponentStage;
            }

            view() {
                console.dir(this.stage.state);
                return this.html`<div>${T.when(this.stage.state.show)
                    .is(true, () => `<div>A</div>`)
                    .otherwise(() => `<div>B</div>`)}</div>`;
            }
        }

        tester.renderSimple(TestImmutableConditionalRepeaterComponent);

        setTimeout(() => {
            let r = tester.content;
            r.should.equal("<test-immutable-conditional-repeater-component>" +
                "<div>" +
                "<div>B</div>" +
                "</div>" +
                "</test-immutable-conditional-repeater-component>");

            done();
        }, 0);
    });

    it("should change item shown in a conditional repeater component when state changed", (done) => {
        class TestMutableConditionalRepeaterComponentStage extends Weavergirl.Stage {
            init() {
                this.state.show = false;
            }
        }

        class TestMutableConditionalRepeaterComponent extends Weavergirl.Component {
            get stageClass() {
                return TestMutableConditionalRepeaterComponentStage;
            }

            view() {
                console.dir(this.stage.state);
                return this.html`<div>${T.when(() => this.stage.state.show)
                    .is(true, () => `<div>A</div>`)
                    .otherwise(() => `<div>B</div>`)}</div>`;
            }
        }

        let elem = tester.renderSimple(TestMutableConditionalRepeaterComponent);

        let expected = "<test-mutable-conditional-repeater-component>" +
            "<div><!--#weavergirl-mutator {\"id\":0,\"type\":\"repeater\",\"expressions\":[\"show\"]}-->" +
            "<div>A</div>" +
            "<!--#/weavergirl-mutator--></div>" +
            "</test-mutable-conditional-repeater-component>";

        setTimeout(() => {
            let r = tester.content;
            r.should.not.equal(expected);

            elem.stage.state.show = true;

            setTimeout(() => {
                tester.content.should.equal(expected);

                done();
            }, 0);
        }, 0);
    });
});