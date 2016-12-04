package io.github.notsyncing.weavergirl.view

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.layout.LayoutContext

abstract class Page : ViewWillEnter, ViewDidEnter {
    var context = PageContext()

    abstract fun init(window: Window, rootElement: FabricElement?)

    abstract fun layout(): LayoutContext

    protected fun dispatchEventsToChildren(elem: FabricElement, func: (FabricElement) -> Unit) {
        for (e in elem.children) {
            func(e)
            dispatchEventsToChildren(e, func)
        }
    }

    override fun viewWillEnter() {
    }

    override fun viewDidEnter() {
    }

    fun renderIn(elem: FabricElement) {
        layout().renderIn(elem)
    }
}