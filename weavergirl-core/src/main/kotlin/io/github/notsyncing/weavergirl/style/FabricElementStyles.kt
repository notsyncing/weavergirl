package io.github.notsyncing.weavergirl.style

class FabricElementStyles {
    private val styles = mutableListOf<FabricElementStyle>()

    fun get(): List<FabricElementStyle> = styles

    operator fun plusAssign(style: FabricElementStyle) {
        this.styles.add(style)
    }

    operator fun <T: FabricElementStyle> plusAssign(styles: Array<T>) {
        this.styles.addAll(styles)
    }

    operator fun minusAssign(style: FabricElementStyle) {
        styles.remove(style)
    }

    operator fun <T: FabricElementStyle> minusAssign(styles: Array<T>) {
        this.styles.removeAll(styles)
    }
}