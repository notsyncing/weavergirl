package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.behaviors.Linkable
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import org.w3c.dom.HTMLAnchorElement

open class Anchor(href: String) : FabricHtmlTagElement<HTMLAnchorElement>("a"), Linkable {
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

        this.href = href
    }
}

