package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.html.element.Body
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.HTMLBodyElement

abstract class HtmlPage : Page() {
    lateinit var window: HtmlWindow
    lateinit var navRootElement: FabricHtmlElement<*>

    override fun init(window: Window, rootElement: FabricElement?) {
        this.window = window as HtmlWindow

        if (rootElement == null) {
            this.rootElement = Body(window.document.body!! as HTMLBodyElement)
        } else {
            this.rootElement = rootElement as FabricHtmlElement<*>
        }

        this.navRootElement = Body(window.document.body!! as HTMLBodyElement)
    }

    fun HtmlLayout.navRoot() {
        navRootElement = this.currParentElem as FabricHtmlElement<*>
    }
}