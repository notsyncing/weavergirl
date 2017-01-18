package io.github.notsyncing.weavergirl.html.style

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import io.github.notsyncing.weavergirl.html.view.HtmlWindow
import io.github.notsyncing.weavergirl.style.FabricElementStyle
import org.w3c.dom.HTMLStyleElement
import org.w3c.dom.css.CSSStyleSheet

object HtmlStyleManager {
    private lateinit var stylesheet: CSSStyleSheet

    private val addedStyles = mutableSetOf<String>()

    fun init(window: HtmlWindow) {
        val elem = window.document.createElement("style") as HTMLStyleElement
        elem.appendChild(window.document.createTextNode(""))
        window.document.head!!.appendChild(elem)

        stylesheet = elem.sheet as CSSStyleSheet
    }

    fun applyElementStyles(element: FabricElement) {
        for (s in element.styles.get()) {
            addStyle(s, element)
        }
    }

    fun applyGlobalElementStyles(page: HtmlPage) {
        for (s in page.globalStyles.get()) {
            addStyle(s)
        }
    }

    private fun addStyle(style: FabricElementStyle, element: FabricElement? = null) {
        if (element is FabricHtmlElement<*>) {
            for (c in style.getName().split(".")) {
                element.addClass(c)
            }
        }

        val name = style.getName(element?.typeIdentityName)

        if (addedStyles.contains(name)) {
            return
        }

        val cssRule = style.toString(element?.typeIdentityName)
        stylesheet.insertRule(cssRule, 0)

        addedStyles.add(name)

        println("Added style for $name: $cssRule")
    }
}