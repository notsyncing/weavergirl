package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.events.AfterShow
import io.github.notsyncing.weavergirl.events.BeforeShow
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import org.w3c.dom.HTMLDivElement

open class CustomElement1 : Div(), BeforeShow, AfterShow {
    override fun afterShow() {

    }

    override fun beforeShow() {

    }
}

fun FabricHtmlElement<*>.customElement1(inner: CustomElement1.() -> Unit): FabricHtmlElement<HTMLDivElement> {
    return this.createChild({ CustomElement1() }, inner)
}