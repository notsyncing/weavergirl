package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import io.github.notsyncing.weavergirl.watchable.Watchable
import org.w3c.dom.HTMLButtonElement

open class Button : FabricHtmlElement<HTMLButtonElement>("button"), Clickable {
    override val clicked: Watchable<String> = Watchable()

    init {
        nativeElement.type = "button"
    }
}

