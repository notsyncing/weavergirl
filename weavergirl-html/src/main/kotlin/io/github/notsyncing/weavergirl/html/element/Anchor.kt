package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.Linkable
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import org.w3c.dom.HTMLAnchorElement

open class Anchor(nativeElement: HTMLAnchorElement,
                  parentElement: FabricHtmlElement<*>?,
                  page: HtmlPage?) :
        FabricHtmlElement<HTMLAnchorElement>(nativeElement, parentElement, page), Linkable {
    override var href: String
        get() = nativeElement.href
        set(value) {
            nativeElement.href = value
        }

    override var pathname: String
        get() = nativeElement.pathname
        set(value) {
            nativeElement.pathname = pathname
        }

    init {
        nativeElement.addEventListener("click", {
            console.info("Current route: ${nativeElement.href}")

            val resolved = HtmlRouter.resolve(nativeElement.href)

            if (resolved != null) {
                console.info("Route matched ${nativeElement.href}")
                it.preventDefault()

                HtmlRouter.goto(resolved)
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
