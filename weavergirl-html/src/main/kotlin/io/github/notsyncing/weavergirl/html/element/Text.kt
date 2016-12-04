package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import org.w3c.dom.Node

open class Text(content: String) : FabricHtmlElement<Node>() {
    init {
        nativeElement = HtmlLayout.rawText(content)
    }

    override fun layout() = HtmlLayout {}
}

