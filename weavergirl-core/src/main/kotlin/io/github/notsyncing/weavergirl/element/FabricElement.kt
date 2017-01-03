package io.github.notsyncing.weavergirl.element

import io.github.notsyncing.weavergirl.action.Action
import io.github.notsyncing.weavergirl.layout.LayoutContext
import io.github.notsyncing.weavergirl.layout.LayoutScope

abstract class FabricElement {
    val children: MutableList<FabricElement> = mutableListOf()
    var parent: FabricElement? = null

    val slotMap: MutableMap<String, FabricElement> = mutableMapOf()
    var defaultSlotElement: FabricElement? = null

    var scope: LayoutScope? = null
    var currentInner: (LayoutContext.(FabricElement) -> Unit)? = null

    protected val slot = SlotMaker(this)

    val sourceActions: MutableList<Action> = mutableListOf()

    open fun insertInto(elem: FabricElement) {
        elem.append(this)
    }

    open fun append(elem: FabricElement, atIndex: Int) {
        elem.remove()

        if ((atIndex < 0) || (atIndex > this.children.lastIndex)) {
            this.children.add(elem)
        } else {
            this.children.add(atIndex, elem)
        }

        elem.parent = this
    }

    fun append(elem: FabricElement) {
        append(elem, -1)
    }

    fun append(elems: List<FabricElement>, atIndex: Int) {
        for (e in elems) {
            append(e, atIndex)
        }
    }

    fun append(elems: List<FabricElement>) {
        append(elems, -1)
    }

    open fun remove() {
        parent?.children?.remove(this)
        this.parent = null
    }

    open fun clear() {
        children.clear()
    }

    abstract fun layout(): LayoutContext

    open fun refresh() {
        val elemStartIndex = parent?.children?.indexOf(this) ?: -1

        if (elemStartIndex < 0) {
            return
        }

        clear()

        layout().renderIn(this, { currentInner?.invoke(this, this@FabricElement) }, elemStartIndex)
    }
}
