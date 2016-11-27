package io.github.notsyncing.weavergirl.view

import io.github.notsyncing.weavergirl.element.FabricElement

abstract class Page {
    var context = PageContext()

    abstract fun init(window: Window, rootElement: Any)

    abstract fun content(): Page.() -> Unit

    abstract fun toDom(): FabricElement<*>

    abstract fun append(elem: FabricElement<*>)
}