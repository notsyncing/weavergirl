package io.github.notsyncing.weavergirl.html.layout

import io.github.notsyncing.weavergirl.layout.LayoutContext
import org.w3c.dom.Element
import org.w3c.dom.Node
import kotlin.browser.document

open class HtmlLayout(inner: HtmlLayout.() -> Unit) : LayoutContext(inner as LayoutContext.() -> Unit) {
    companion object {
        fun <T : Element> raw(tagName: String): T {
            return document.createElement(tagName) as T
        }

        fun rawText(text: String): Node {
            return document.createTextNode(text)
        }
    }
}
