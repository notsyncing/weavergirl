package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.element.FabricElement
import io.github.notsyncing.weavergirl.element.SlotMaker
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.layout.HtmlLayout

class CustomElement2 : FabricElement() {
    val slot = SlotMaker(this)

    override fun layout() = HtmlLayout {
        Div() - {
            slot.make(this@CustomElement2, "slot1")
        }

        Div() - {
            slot.make(this@CustomElement2, "slot2")
        }
    }
}