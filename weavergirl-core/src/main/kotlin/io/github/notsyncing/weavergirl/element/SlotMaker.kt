package io.github.notsyncing.weavergirl.element

import io.github.notsyncing.weavergirl.layout.LayoutContext

class SlotMaker(private val containerElem: FabricElement) {
    fun make(slotElem: FabricElement) {
        containerElem.defaultSlotElement = slotElem
    }

    fun make(slotElem: FabricElement, slotName: String) {
        containerElem.slotMap[slotName] = slotElem
    }

    fun make(layout: LayoutContext, slotName: String) {
        if (layout.currParentElem != null) {
            make(layout.currParentElem!!, slotName)
        }
    }
}