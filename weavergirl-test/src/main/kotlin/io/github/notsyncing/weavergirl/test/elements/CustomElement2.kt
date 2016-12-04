package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout

class CustomElement2 : Div() {
    override fun layout() = HtmlLayout {
        Div() - {
            slot.make(this, "slot1")
        }

        Div() - {
            slot.make(this, "slot2")
        }
    }
}