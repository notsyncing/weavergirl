package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import org.w3c.dom.Element

abstract class FabricHtmlTagElement<T: Element>(private val tagName: String) : FabricHtmlElement<T>() {
    var id: String
        get() = nativeElement.id
        set(value) {
            nativeElement.id = value
        }

    init {
        if (tagName.isNotEmpty()) {
            nativeElement = HtmlLayout.raw(tagName)
        }
    }

    constructor(nativeElement: T) : this("") {
        this.nativeElement = nativeElement
    }

    override fun layout() = HtmlLayout {
        slot.make(this@FabricHtmlTagElement)
    }
}