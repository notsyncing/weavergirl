package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.element.Anchor
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.Text
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestC : HtmlPage() {
    override fun layout() = HtmlLayout {
        Div() - {
            +Text("I'm test page C!")
        }

        Div() - {
            Anchor(href = "/page2") - {
                +Text("Goto test page 2")
            }
        }
    }
}