package io.github.notsyncing.weavergirl.element

import io.github.notsyncing.weavergirl.layout.LayoutContext

abstract class FabricElement {
    val children: MutableList<FabricElement> = mutableListOf()
    var parent: FabricElement? = null

    val slotMap: MutableMap<String, FabricElement> = mutableMapOf()
    var defaultSlotElement: FabricElement? = null

    open fun insertInto(elem: FabricElement) {
        elem.append(this)
    }

    open fun append(elem: FabricElement) {
        elem.remove()

        this.children.add(elem)
        elem.parent = this
    }

    fun append(elems: List<FabricElement>) {
        for (e in elems) {
            append(e)
        }
    }

    open fun remove() {
        parent?.children?.remove(this)
        this.parent = null
    }

    open fun clear() {
        children.clear()
    }

    abstract fun layout(): LayoutContext
}
