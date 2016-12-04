package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.element.Anchor
import io.github.notsyncing.weavergirl.html.element.Button
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.Text
import io.github.notsyncing.weavergirl.html.element.input.TextInput
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import io.github.notsyncing.weavergirl.test.elements.CustomElement1
import io.github.notsyncing.weavergirl.test.elements.CustomElement2

class IndexPage : HtmlPage() {
    override fun layout() = HtmlLayout {
        Div() - {
            Div() - {
                +Text("Hello, world!")
            }

            Anchor(href = "http://www.baidu.com/") - {
                +Text("External link")
            }

            Anchor(href = "/page1") - {
                +Text("Internal link")
            }

            Anchor(href = "/layout/a") - {
                +Text("Layout link")
            }

            Div() - {
                Div() - {
                    Anchor(href = "/page3?id=1") - {
                        +Text("Parameter in querystring")
                    }
                }

                Div() - {
                    Anchor(href = "/page4/5") - {
                        +Text("Parameter in url")
                    }
                }
            }
        }

        CustomElement1() - {
            +Text("Click me")
        }

        Div() - {
            Div() - {
                +TextInput()
            }

            Div() - {

            }

            Div() - {
                Button() - {
                    +Text("Show data")
                }
            }
        }

        CustomElement2() - {
            slot("slot1") {
                Div() - {
                    +Text("I'm in slot 1!")
                }
            }

            slot("slot2") {
                Div() - {
                    +Text("I'm in slot 2!")
                }
            }
        }
    }
}