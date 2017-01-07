package io.github.notsyncing.weavergirl.html.interop.jquery

import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import jquery.JQuery
import jquery.jq
import kotlin.browser.window

fun FabricHtmlElement<*>.toJQuery(): JQuery? {
    if (!window.asDynamic().jQuery) {
        println("You invoked toJQuery() on $this, but jQuery is not loaded!")
        return null
    }

    return jq(this.nativeElement)
}
