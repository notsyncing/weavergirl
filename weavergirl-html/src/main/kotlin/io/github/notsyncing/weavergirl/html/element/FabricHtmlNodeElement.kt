package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import io.github.notsyncing.weavergirl.html.style.HtmlStyleManager
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.dom.clear
import kotlin.dom.removeFromParent

abstract class FabricHtmlNodeElement<T: Node> : FabricElement() {
    lateinit var nativeElement: T

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

    override fun hasNativeElement() = nativeElement != null

    override fun setNativeElement(nativeElement: Any) {
        this.nativeElement = nativeElement as T
    }

    override fun getNativeElement() = this.nativeElement

    override fun append(elem: FabricElement, atIndex: Int) {
        super.append(elem, atIndex)

        if (!elem.hasNativeElement()) {
            return
        }

        if ((elem is FabricHtmlNodeElement<*>) && (nativeElement != elem.nativeElement)) {
            if ((atIndex < 0) || (atIndex > nativeElement.childNodes.length - 1)) {
                nativeElement.appendChild(elem.nativeElement)
            } else {
                nativeElement.insertBefore(elem.nativeElement, nativeElement.childNodes[atIndex])
            }
        }

        attachEventListeners()

        HtmlStyleManager.applyElementStyles(this)
    }

    override fun insertInto(elem: FabricElement) {
        super.insertInto(elem)

        if (elem is FabricHtmlNodeElement<*>) {
            (elem.nativeElement as HTMLElement).appendChild(nativeElement)
        }

        attachEventListeners()
    }

    override fun remove() {
        super.remove()

        if (!hasNativeElement()) {
            println("Following element has no native element:")
            console.dir(this)
        } else {
            nativeElement.removeFromParent()
        }
    }

    override fun clear() {
        super.clear()

        nativeElement.clear()
    }
}