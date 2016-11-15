package io.github.notsyncing.weavergirl.element

import io.github.notsyncing.weavergirl.view.Page
import org.w3c.dom.Document
import org.w3c.dom.Node

abstract class FabricElement<T>(val nativeElement: T,
                                var parent: FabricElement<*>? = null,
                                val page: Page? = null) {
    val children: MutableList<FabricElement<*>> = mutableListOf()

    init {
        parent?.children?.add(this)
    }

    open fun insertInto(elem: FabricElement<*>) {
        elem.append(this)
    }

    open fun append(elem: FabricElement<*>) {
        this.children.add(elem)
        elem.parent = this
    }

    open fun remove() {
        parent?.children?.remove(this)
    }
}