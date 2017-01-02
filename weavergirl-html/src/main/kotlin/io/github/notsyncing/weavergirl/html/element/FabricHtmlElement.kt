package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.dom.clear
import kotlin.dom.removeFromParent

abstract class FabricHtmlElement<T: Node> : FabricElement() {
    protected lateinit var nativeElement: T

    open protected fun makeClickable(clickable: Clickable) {
        nativeElement.addEventListener("click", {
            clickable.clicked.fire()
        })
    }

    private fun attachEventListeners() {
        if (this is Clickable) {
            makeClickable(this)
        }
    }

    override fun append(elem: FabricElement, atIndex: Int) {
        super.append(elem, atIndex)

        if (elem is FabricHtmlElement<*>) {
            if ((atIndex < 0) || (atIndex > nativeElement.childNodes.length - 1)) {
                nativeElement.appendChild(elem.nativeElement)
            } else {
                nativeElement.insertBefore(elem.nativeElement, nativeElement.childNodes[atIndex])
            }
        }

        attachEventListeners()
    }

    override fun insertInto(elem: FabricElement) {
        super.insertInto(elem)

        if (elem is FabricHtmlElement<*>) {
            (elem.nativeElement as HTMLElement).appendChild(nativeElement)
        }

        attachEventListeners()
    }

    override fun remove() {
        super.remove()

        nativeElement.removeFromParent()
    }

    override fun clear() {
        super.clear()

        nativeElement.clear()
    }
}