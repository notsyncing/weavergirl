package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.element.Anchor
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.Text
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestPage1 : HtmlPage() {
    override fun layout() = HtmlLayout {
        Div() - {
            +Text("I'm test page 1!")
        }

        Anchor(href = "/") - {
            +Text("Back")
        }
    }
}