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

    override fun viewDidEnter() {
    }

    override fun viewDidLeave() {
    }

    override fun viewWillEnter() {
    }

    override fun viewWillLeave() {
    }

    fun renderIn(elem: FabricElement) {
        layout().renderIn(elem)
    }
}