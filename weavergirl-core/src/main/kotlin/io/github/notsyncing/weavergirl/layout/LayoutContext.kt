package io.github.notsyncing.weavergirl.layout

import io.github.notsyncing.weavergirl.element.FabricElement

abstract class LayoutContext(protected val inner: LayoutContext.() -> Unit) {
    private val elements: MutableList<FabricElement> = mutableListOf()

    var currParentElem: FabricElement? = null

    fun renderIn(elem: FabricElement) {
        elements.clear()
        this.inner()
        elem.append(elements)
    }

    operator fun FabricElement.minus(inner: LayoutContext.() -> Unit) {
        if (currParentElem == null) {
            elements.add(this)
        } else {
            currParentElem!!.append(this)
        }

        val oldCurr = currParentElem
        currParentElem = this

        this@LayoutContext.inner()

        currParentElem = oldCurr
    }

    operator fun FabricElement.unaryPlus() {
        if (currParentElem == null) {
            elements.add(this)
        } else {
            currParentElem!!.append(this)
        }
    }

    fun slot(slotName: String, inner: FabricElement.() -> Unit) {
        val elem = currParentElem?.slotMap?.get(slotName)
        elem?.inner()
    }
}
