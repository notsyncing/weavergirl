package io.github.notsyncing.weavergirl.view

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter

abstract class Page : ViewWillEnter, ViewDidEnter {
    var context = PageContext()

    abstract fun init(window: Window, rootElement: Any)

    abstract fun content(): Page.() -> Unit

    abstract fun toDom(): FabricElement<*>

    abstract fun append(elem: FabricElement<*>)

    protected fun dispatchEventsToChildren(elem: FabricElement<*>, func: (FabricElement<*>) -> Unit) {
        for (e in elem.children) {
            func(e)
            dispatchEventsToChildren(e, func)
        }
    }

    override fun viewWillEnter() {
    }

    override fun viewDidEnter() {
    }
}