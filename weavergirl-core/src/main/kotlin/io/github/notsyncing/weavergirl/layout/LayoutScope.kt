package io.github.notsyncing.weavergirl.layout

import io.github.notsyncing.weavergirl.element.FabricElement

class LayoutScope(val layout: LayoutContext, val parentElem: FabricElement, val inner: LayoutContext.() -> Unit) {
    fun refresh() {
        val scopeElemStartIndex = parentElem.children.indexOfFirst { it.scope == this }

        parentElem.children.removeAll { it.scope == this }

        layout.renderIn(parentElem, inner, scopeElemStartIndex)
    }
}