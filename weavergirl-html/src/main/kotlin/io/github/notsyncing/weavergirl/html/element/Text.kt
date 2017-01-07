package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import org.w3c.dom.Node

open class Text(content: String) : FabricHtmlNodeElement<Node>() {
    var content: String
        get() = nativeElement.textContent ?: ""
        set(value) {
            nativeElement.textContent = value
        }

    init {
        nativeElement = HtmlLayout.rawText(content)
    }

    override fun layout() = HtmlLayout {}
}

