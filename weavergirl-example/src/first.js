class FirstPageStage extends Weavergirl.Stage {
    stageWillEnter() {
        this.state = {
            counter: 0,
            text: "",
            switchOn: false,
            type: "text",
            inputData: "old",

            computed: function () {
                return this.counter + this.text;
            },

            switchOnComputed: function () {
                return this.switchOn;
            }
        };
    }

    @OnClick("#btnIncrease")
    incCounter() {
        this.state.counter++;
    }

    @OnInput("#txtInput")
    changeText() {
        this.state.text = this.txtInput.value;
    }

    @OnClick("#btnToggle")
    toggleSwitch() {
        this.state.switchOn = !this.state.switchOn;
    }

    @OnClick("#btnToggleType")
    toggleType() {
        if (this.state.type === "checkbox") {
            this.state.type = "text";
        } else {
            this.state.type = "checkbox";
        }
    }

    @OnClick("#btnSet")
    setInputData() {
        this.state.inputData = "reset";
    }
}

class FirstPage extends Weavergirl.Component {
    get stageClass() {
        return FirstPageStage;
    }

    view() {
        console.info("FirstPage view!");
        console.dir(this.stage);

        return this.html`
<div>
    <div>I'm first page!</div>
    <div>Counter: ${() => this.stage.state.counter}</div>
    <button id="btnIncrease" weavergirl-keep-id>Increase</button>
    
    <div>
        <div>Text: ${() => this.stage.state.text}</div>
        <input id="txtInput" weavergirl-keep-id type="text">
    </div>
    
    <div>
        ${T(this).when(() => this.stage.state.switchOn)
            .is(true, () =>
                `<div>I'm on!</div>`)
            .otherwise(() =>
                `<div>I'm off!</div>`)}
        
        <button id="btnToggle" weavergirl-keep-id>${I("Toggle")}</button>
    </div>
    
    <div>
        <input ${T(this).attr("type", () => this.stage.state.type)}>
        <button id="btnToggleType" weavergirl-keep-id>${I("Toggle {0}", 2)}</button>    
    </div>
    
    <div>
        <span>Computed: ${() => this.stage.state.computed()}</span>    
    </div>
    
    <div>
        ${T(this).when(() => this.stage.state.switchOnComputed())
            .is(true, () =>
                `<div>I'm on!</div>`)
            .otherwise(() =>
                `<div>I'm off!</div>`)}
    </div>
    
    <div>
        <input ${T(this).bind(() => this.stage.state.inputData)}>
        <span>Entered: ${() => this.stage.state.inputData}</span>
        <button id="btnSet" weavergirl-keep-id>Set</button>
    </div>
</div>
`;
    }
}

if (module) {
    module.exports = FirstPage;
}