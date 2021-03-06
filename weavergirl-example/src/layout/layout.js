class WeavergirlLayoutStage extends Weavergirl.Stage {
    stageWillEnter() {
        this.state.menus = window.menus || [];

        setTimeout(() => {
            if (!window.firstExecuted) {
                window.firstExecuted = true;
            } else {
                return;
            }

            console.info("---------");
            this.state.menus[0].name = "Here!";

            setTimeout(() => {
                if (!window.secondExecuted) {
                    window.secondExecuted = true;
                } else {
                    return;
                }

                console.info("---------");
                this.state.menus.push({name: "Fourth", href: "/fourth"});

                setTimeout(() => {
                    if (!window.thirdExecuted) {
                        window.thirdExecuted = true;
                    } else {
                        return;
                    }

                    console.info("---------");
                    this.state.menus[2] = {name: "Third-2!", href: "/third"};
                }, 2000);
            }, 2000);
        }, 2000);
    }

    @OnClick(".layout-menu-link")
    go(event) {
        event.preventDefault();

        Weavergirl.Router.navigate(event.target.href);

        return false;
    }
}

class WeavergirlLayout extends Weavergirl.Component {
    get stageClass() {
        return WeavergirlLayoutStage;
    }

    view() {
        return `
<div>
    <div>
        ${this.T.forEach(() => this.stage.state.menus, (m, i) =>
            this.html`<a class="layout-menu-link" href="${m.href}">${() => m.name}</a>`
        )}
    </div>
    <div weavergirl-slot></div>
</div>
`;
    }
}

window.WeavergirlLayout = WeavergirlLayout;

if (module) {
    module.exports = WeavergirlLayout;
}
