package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import org.w3c.dom.HTMLButtonElement

open class Button : FabricHtmlTagElement<HTMLButtonElement>("button"), Clickable {
    init {
        nativeElement.type = "button"
    }
}

