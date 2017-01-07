package io.github.notsyncing.weavergirl.style

class FabricElementStyles {
    private val styles = mutableListOf<FabricElementStyle>()

    fun get(): List<FabricElementStyle> = styles

    infix fun add(style: FabricElementStyle) {
        styles.add(style)
    }

    operator fun plusAssign(style: FabricElementStyle) {
        add(style)
    }

    operator fun plusAssign(styles: Array<FabricElementStyle>) {
        this.styles.addAll(styles)
    }

    operator fun minusAssign(style: FabricElementStyle) {
        styles.remove(style)
    }

    operator fun minusAssign(styles: Array<FabricElementStyle>) {
        this.styles.removeAll(styles)
    }
}