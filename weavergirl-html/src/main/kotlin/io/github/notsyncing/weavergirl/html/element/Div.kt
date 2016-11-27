package io.github.notsyncing.weavergirl.html.element

import org.w3c.dom.HTMLDivElement

open class Div : FabricHtmlElement<HTMLDivElement>("div") {
}

fun FabricHtmlElement<*>.div(inner: Div.() -> Unit): FabricHtmlElement<HTMLDivElement> {
    return this.createChild({ Div() }, inner)
}
