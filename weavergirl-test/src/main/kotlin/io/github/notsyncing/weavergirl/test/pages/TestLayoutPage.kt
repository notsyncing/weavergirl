package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.element.Anchor
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.Text
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestLayoutPage : HtmlPage() {
    override fun layout() = HtmlLayout {
        Div() - {
            +Text("I'm test layout!")

            Anchor(href = "/layout/a") - {
                +Text("Goto A")
            }

            Anchor(href = "/layout/b") - {
                +Text("Goto B")
            }

            Anchor(href = "/layout/c") - {
                +Text("Goto C")
            }
        }

        Div() - {
            navRoot()
        }

        Anchor(href = "/") - {
            +Text("Back")
        }
    }
}