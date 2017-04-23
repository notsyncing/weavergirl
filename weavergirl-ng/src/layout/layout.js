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

    go(event, url) {
        event.preventDefault();

        Weavergirl.Router.navigate(url);

        return false;
    }
}

class WeavergirlLayout extends Weavergirl.Component {
    get stageClass() {
        return WeavergirlLayoutStage;
    }

    view() {
        return `
<ons-splitter>
    <ons-splitter-side side="left" width="220px">
        <ons-page>
            <ons-list>
                ${T.forEach(() => this.stage.state.menus, (m, i) =>
                    this.html`<ons-list-item tappable href="${m.href}" onclick="this.stage.go(event, '${m.href}')">${() => this.stage.state.menus[i].name}</ons-list-item>`
                )}
            </ons-list>
        </ons-page>
    </ons-splitter-side>
    <ons-splitter-content weavergirl-slot></ons-splitter-content>
</ons-splitter>
`;
    }
}

window.WeavergirlLayout = WeavergirlLayout;

if (module) {
    module.exports = WeavergirlLayout;
}
