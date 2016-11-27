package io.github.notsyncing.weavergirl.element

abstract class FabricElement<T>(val nativeElement: T) {
    val children: MutableList<FabricElement<*>> = mutableListOf()
    var parent: FabricElement<*>? = null

    init {
        parent?.children?.add(this)
    }

    open fun insertInto(elem: FabricElement<*>) {
        elem.append(this)
    }

    open fun append(elem: FabricElement<*>) {
        this.children.add(elem)
        elem.parent = this
    }

    open fun remove() {
        parent?.children?.remove(this)
        this.parent = null
    }


}