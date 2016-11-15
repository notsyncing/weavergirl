package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import org.w3c.dom.*
import org.w3c.dom.Text
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import kotlin.browser.document

open class Text(nativeElement: Node,
                parentElement: FabricHtmlElement<*>?,
                page: HtmlPage?) :
        FabricHtmlElement<Node>(nativeElement, parentElement, page) {
}

fun FabricHtmlElement<*>.text(content: String): FabricHtmlElement<Node> {
    val e = (this.page as HtmlPage).window.document.createTextNode(content)
    val d = Text(e, this, this.page)

    return d
}
