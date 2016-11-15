package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.browser.document

abstract class HtmlPage : Page() {
    lateinit var rootElement: FabricHtmlElement<HTMLElement>
    lateinit var window: HtmlWindow

    override fun init(window: Window, rootElement: Any) {
        this.window = window as HtmlWindow
        this.rootElement = FabricHtmlElement(rootElement as HTMLElement, null, this)
    }

    override fun append(elem: FabricElement<*>) {
        rootElement.append(elem)
    }

    override fun toDom(): FabricElement<*> {
        content().invoke(this)
        return rootElement
    }
}