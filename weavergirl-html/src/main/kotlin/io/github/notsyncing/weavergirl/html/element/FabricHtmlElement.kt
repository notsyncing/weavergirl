package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import kotlin.dom.removeFromParent

open class FabricHtmlElement<T: Node>(nativeElement: T,
                                      parentElement: FabricHtmlElement<*>? = null,
                                      page: HtmlPage? = null) :
        FabricElement<T>(nativeElement, parentElement, page) {
    init {
        parentElement?.nativeElement?.appendChild(nativeElement)
    }

    override fun append(elem: FabricElement<*>) {
        super.append(elem)

        nativeElement.appendChild(elem.nativeElement as Node)
    }

    override fun insertInto(elem: FabricElement<*>) {
        super.insertInto(elem)

        (elem.nativeElement as HTMLElement).appendChild(nativeElement)
    }

    override fun remove() {
        super.remove()

        nativeElement.removeFromParent()
    }
}