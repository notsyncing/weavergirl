package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.events.Clicked
import io.github.notsyncing.weavergirl.events.ValueChanged
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.dom.clear
import kotlin.dom.removeFromParent

abstract class FabricHtmlElement<T: Node> : FabricElement() {
    protected lateinit var nativeElement: T

    private fun attachEventListeners() {
        if (this is Clicked) {
            nativeElement.addEventListener("click", { this.onClick() })
        }

        if (this is ValueChanged) {
            nativeElement.addEventListener("change", { this.onValueChanged() })
        }
    }

    override fun append(elem: FabricElement) {
        super.append(elem)

        if (elem is FabricHtmlElement<*>) {
            nativeElement.appendChild(elem.nativeElement)
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