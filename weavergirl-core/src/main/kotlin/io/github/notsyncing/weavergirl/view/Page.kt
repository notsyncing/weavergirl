package io.github.notsyncing.weavergirl.view

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewDidLeave
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.events.ViewWillLeave
import io.github.notsyncing.weavergirl.layout.LayoutContext

abstract class Page : ViewWillEnter, ViewDidEnter, ViewWillLeave, ViewDidLeave {
    var context = PageContext()
    lateinit var rootElement: FabricElement

    abstract fun init(window: Window, rootElement: FabricElement?)

    abstract fun layout(): LayoutContext

    protected fun dispatchEventsToChildren(elem: FabricElement, func: (FabricElement) -> Unit) {
        for (e in elem.children) {
            func(e)
            dispatchEventsToChildren(e, func)
        }
    }

    override fun viewWillEnter() {
        dispatchEventsToChildren(rootElement) {
            if (it is ViewWillEnter) {
                it.viewWillEnter()
            }
        }
    }

    override fun viewDidEnter() {
        dispatchEventsToChildren(rootElement) {
            if (it is ViewDidEnter) {
                it.viewDidEnter()
            }
        }
    }

    override fun viewWillLeave() {
        dispatchEventsToChildren(rootElement) {
            if (it is ViewWillLeave) {
                it.viewWillLeave()
            }
        }
    }

    override fun viewDidLeave() {
        dispatchEventsToChildren(rootElement) {
            if (it is ViewDidLeave) {
                it.viewDidLeave()
            }
        }
    }

    fun renderIn(elem: FabricElement) {
        layout().renderIn(elem)
    }
}