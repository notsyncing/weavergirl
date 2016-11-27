package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.Linkable
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import org.w3c.dom.HTMLAnchorElement

open class Anchor : FabricHtmlElement<HTMLAnchorElement>("a"), Linkable {
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

fun FabricHtmlElement<*>.a(href: String, inner: Anchor.() -> Unit): Anchor {
    return this.createChild({ Anchor() }, inner) {
        it.href = href
    }
}
