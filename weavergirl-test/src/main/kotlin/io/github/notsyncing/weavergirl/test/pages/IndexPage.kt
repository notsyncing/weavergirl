package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.html.element.Anchor
import io.github.notsyncing.weavergirl.html.element.Button
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.Text
import io.github.notsyncing.weavergirl.html.element.input.TextInput
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import io.github.notsyncing.weavergirl.layout.LayoutScope
import io.github.notsyncing.weavergirl.test.elements.CustomElement1
import io.github.notsyncing.weavergirl.test.elements.CustomElement2

class IndexPage : HtmlPage() {
    private var cusElem1: CustomElement1? = null
    private var elem: FabricElement? = null
    private var input: TextInput? = null
    private var list: FabricElement? = null
    private var showText: Text? = null
    private var scope1: LayoutScope? = null
    private var btn: Button? = null
    private var textList = mutableListOf<String>()

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

        cusElem1 = CustomElement1() - {
            +Text("Click me")
        }

        Div() - {
            Div() - {
                input = +TextInput()
            }

            scope1 = scope {
                elem = Div() - {
                    showText = +Text("")
                }

                list = Div() - {
                    for (t in textList) {
                        Div() - {
                            +Text(t)
                        }
                    }
                }
            }

            Div() - {
                btn = Button() - {
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

    override fun viewDidEnter() {
        super.viewDidEnter()

        input!!.value.onChanged {
            println("Changed: from ${it.oldValue} to ${it.newValue}")
            showText!!.content = it.newValue ?: ""

            textList.add(it.newValue ?: "<EMPTY>")
            list!!.refresh()
        }

        btn!!.clicked.onFired {
            println("Data: ${input!!.value.get()}")
        }
    }
}