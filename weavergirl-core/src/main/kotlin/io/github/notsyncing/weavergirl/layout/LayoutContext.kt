package io.github.notsyncing.weavergirl.layout

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import org.w3c.dom.Node

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

        println("-----")
        console.dir(this)

        this.currentInner = inner as LayoutContext.(FabricElement) -> Unit
        this.scope = currScope

        if (this is ViewWillEnter) {
            this.viewWillEnter()
        }

        if (currParentElem == null) {
            println("Current no parent element")
            elements.add(this)
        } else {
            println("Append to parent element:")
            console.dir(currParentElem!!)

            if (!currParentElem!!.hasNativeElement()) {
                currParentElem!!.setNativeElement(this.getNativeElement())

                println("Set native element:")
                console.dir(currParentElem!!.getNativeElement())
            }

            currParentElem!!.append(this)

            println("Current parent native element: " + (currParentElem!!.getNativeElement() as Node).childNodes.length)
            console.dir(currParentElem!!.getNativeElement())
        }

        val oldCurr = currParentElem
        currParentElem = this

        this._layout().inner.invoke(this@LayoutContext)
        this@LayoutContext.inner(this)

        currParentElem = oldCurr

        if (this is ViewDidEnter) {
            this.viewDidEnter()
        }

        return this
    }

    operator fun <T: FabricElement> T.unaryPlus(): T {
        return this.minus {  }
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
