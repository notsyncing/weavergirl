package io.github.notsyncing.weavergirl.html.style

import io.github.notsyncing.weavergirl.html.view.HtmlWindow
import org.w3c.dom.HTMLStyleElement
import org.w3c.dom.css.CSSStyleSheet

object HtmlStyleManager {
    private lateinit var stylesheet: CSSStyleSheet

    val globalStyles: StyleSet = StyleSet()
    val localStyles: MutableMap<String, StyleSet> = mutableMapOf()

    fun init(window: HtmlWindow) {
        val elem = window.document.createElement("style") as HTMLStyleElement
        elem.appendChild(window.document.createTextNode(""))
        window.document.head!!.appendChild(elem)

        stylesheet = elem.sheet as CSSStyleSheet
    }
}