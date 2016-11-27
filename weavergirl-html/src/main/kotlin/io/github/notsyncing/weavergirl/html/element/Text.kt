package io.github.notsyncing.weavergirl.html.element

import org.w3c.dom.Node
import kotlin.browser.document

open class Text(content: String) : FabricHtmlElement<Node>(document.createTextNode(content)) {
}

fun FabricHtmlElement<*>.text(content: String): Text {
    return this.createChild({ Text(content) })
}
