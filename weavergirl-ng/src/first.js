class FirstPageStage extends Weavergirl.Stage {
    stageWillEnter() {
        this.state.counter = 0;
        this.state.text = "";
        this.state.switchOn = false;
    }

    incCounter() {
        this.state.counter++;
    }

    changeText() {
        this.state.text = this.txtInput.value;
    }

    toggleSwitch() {
        this.state.switchOn = !this.state.switchOn;
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
    <button id="btnIncrease" onclick="this.stage.incCounter()">Increase</button>
    
    <div>
        <div>Text: ${() => this.stage.state.text}</div>
        <input id="txtInput" type="text" oninput="this.stage.changeText()">
    </div>
    
    <div>
        ${T.when(() => this.stage.state.switchOn)
            .is(true, () =>
                `<div>I'm on!</div>`)
            .otherwise(() =>
                `<div>I'm off!</div>`)}
        
        <button id="btnToggle" onclick="this.stage.toggleSwitch()">Toggle</button>
    </div>
</div>
`;
    }
}

if (module) {
    module.exports = FirstPage;
}