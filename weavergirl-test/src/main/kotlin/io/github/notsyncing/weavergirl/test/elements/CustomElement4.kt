package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.html.element.Text
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import org.w3c.dom.HTMLElement

class CustomElement4 : FabricHtmlElement<HTMLElement>() {
    override fun layout() = HtmlLayout {
        Div() - {
            +Text("I'm inner post-init native element!")
        }
    }
}