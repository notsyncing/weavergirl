class WeavergirlLayoutStage extends Weavergirl.Stage {
    stageWillEnter() {
        this.state.menus = window.menus || [];

        setTimeout(() => {
            console.info("---------");
            this.state.menus[0].name = "Here!";

            setTimeout(() => {
                console.info("---------");
                this.state.menus.push({name: "Fourth", href: "/fourth"});
            }, 2000);
        }, 2000);
    }

    go(event, url) {
        event.preventDefault();

        Weavergirl.Router.navigate(url);

        return false;
    }
}

class WeavergirlLayout extends Weavergirl.Component {
    constructor() {
        super("/weavergirl-ng/layout/layout.html");
    }

    get stageClass() {
        return WeavergirlLayoutStage;
    }
}

window.WeavergirlLayout = WeavergirlLayout;

if (module) {
    module.exports = WeavergirlLayout;
}
