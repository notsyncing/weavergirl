package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import org.w3c.dom.HTMLDivElement

open class CustomElement1 : Div(), ViewWillEnter, ViewDidEnter {
    override fun viewWillEnter() {
        console.info("I'm going to enter this window!")
    }

    override fun viewDidEnter() {
        console.info("I entered this window!")
    }
}

fun FabricHtmlElement<*>.customElement1(inner: CustomElement1.() -> Unit): FabricHtmlElement<HTMLDivElement> {
    return this.createChild({ io.github.notsyncing.weavergirl.test.elements.CustomElement1() }, inner)
}