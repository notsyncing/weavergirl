package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.element.Linkable
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import org.w3c.dom.*
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import kotlin.browser.document
import kotlin.dom.build.createElement

open class Anchor(nativeElement: HTMLAnchorElement,
                  parentElement: FabricHtmlElement<*>?,
                  page: HtmlPage?) :
        FabricHtmlElement<HTMLAnchorElement>(nativeElement, parentElement, page), Linkable {
    override var href: String
        get() = nativeElement.href
        set(value) {
            nativeElement.href = value
        }

    init {
        nativeElement.addEventListener("click", {
            if (HtmlRouter.hasRoute(nativeElement.href)) {
                it.preventDefault()

                HtmlRouter.goto(nativeElement.href)
            }
        })
    }
}

fun FabricHtmlElement<*>.a(href: String, inner: Anchor.() -> Unit): FabricHtmlElement<HTMLAnchorElement> {
    val e = (this.page as HtmlPage).window.document.createElement("a") as HTMLAnchorElement
    val d = Anchor(e, this, this.page)
    d.href = href
    d.inner()

    return d
}
