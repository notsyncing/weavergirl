package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.dom.asList

abstract class HtmlPage : Page() {
    lateinit var rootElement: FabricHtmlElement<HTMLElement>
    lateinit var window: HtmlWindow
    lateinit var navRootElement: HTMLElement

    override fun init(window: Window, rootElement: Any) {
        this.window = window as HtmlWindow
        this.rootElement = FabricHtmlElement(rootElement as HTMLElement)
        this.navRootElement = window.document.body!!
    }

    override fun append(elem: FabricElement<*>) {
        rootElement.append(elem)
    }

    override fun toDom(): FabricElement<*> {
        content().invoke(this)
        return rootElement
    }

    fun children(): Array<Node> {
        return (toDom().nativeElement as HTMLElement).childNodes.asList().toTypedArray()
    }

    fun FabricHtmlElement<*>.navRoot() {
        navRootElement = this.nativeElement as HTMLElement
    }

    override fun viewWillEnter() {
        dispatchEventsToChildren(rootElement) {
            if (it is ViewWillEnter) {
                it.viewWillEnter()
            }
        }

        super.viewWillEnter()
    }

    override fun viewDidEnter() {
        dispatchEventsToChildren(rootElement) {
            if (it is ViewDidEnter) {
                it.viewDidEnter()
            }
        }

        super.viewDidEnter()
    }
}