package io.github.notsyncing.weavergirl.layout

import io.github.notsyncing.weavergirl.element.FabricElement

abstract class LayoutContext(protected val inner: LayoutContext.() -> Unit) {
    private val elements: MutableList<FabricElement> = mutableListOf()

    var rootElement: FabricElement? = null

    var currParentElem: FabricElement? = null
    var currScope: LayoutScope? = null

    fun renderIn(elem: FabricElement) {
        elements.clear()
        this.inner()
        elem.append(elements)
    }

    fun renderIn(elem: FabricElement, inner: LayoutContext.() -> Unit, childStartIndex: Int) {
        elements.clear()
        this.inner()

        if (childStartIndex > elem.children.lastIndex) {
            elem.append(elements)
        } else {
            elem.append(elements, childStartIndex)
        }
    }

    operator fun <T: FabricElement> T.minus(inner: LayoutContext.(T) -> Unit): T {
        if (rootElement == null) {
            rootElement = this
        }

        this.currentInner = inner as LayoutContext.(FabricElement) -> Unit

        if (currParentElem == null) {
            elements.add(this)
        } else {
            currParentElem!!.append(this)
        }

        this.scope = currScope

        val oldCurr = currParentElem
        currParentElem = this

        this._layout().inner.invoke(this@LayoutContext)
        this@LayoutContext.inner(this)

        currParentElem = oldCurr

        return this
    }

    operator fun <T: FabricElement> T.unaryPlus(): T {
        if (currParentElem == null) {
            elements.add(this)
        } else {
            currParentElem!!.append(this)
        }

        return this
    }

    fun slot(slotName: String, inner: LayoutContext.() -> Unit) {
        val elem = currParentElem?.slotMap?.get(slotName)
        val oldCurr = currParentElem
        currParentElem = elem

        this.inner()

        currParentElem = oldCurr
    }

    fun scope(inner: LayoutContext.() -> Unit): LayoutScope {
        val s = LayoutScope(this, currParentElem!!, inner)
        currScope = s

        this@LayoutContext.inner()

        currScope = null
        return s
    }
}
