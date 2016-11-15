package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import org.w3c.dom.*
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import kotlin.browser.document
import kotlin.dom.build.createElement

open class Div(nativeElement: HTMLDivElement,
               parentElement: FabricHtmlElement<*>?,
               page: HtmlPage?) :
        FabricHtmlElement<HTMLDivElement>(nativeElement, parentElement, page) {
}

fun FabricHtmlElement<*>.div(inner: Div.() -> Unit): FabricHtmlElement<HTMLDivElement> {
    val e = (this.page as HtmlPage).window.document.createElement("div") as HTMLDivElement
    val d = Div(e, this, this.page)
    d.inner()

    return d
}
