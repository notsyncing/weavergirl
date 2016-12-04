package io.github.notsyncing.weavergirl.element

class SlotMaker(private val containerElem: FabricElement) {
    fun make(slotElem: FabricElement) {
        containerElem.defaultSlotElement = slotElem
    }

    fun make(slotElem: FabricElement, slotName: String) {
        containerElem.slotMap[slotName] = slotElem
    }
}