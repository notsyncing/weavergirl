package io.github.notsyncing.weavergirl.style

abstract class FabricElementStyle(name: String) {
    val styles = mutableMapOf<String, Any>()

    private var styleName: String = name
    private var styleString: String = ""

    fun toString(typeIdentifyName: String): String {
        if (styleString.isEmpty()) {
            styleString = generateStyleString(typeIdentifyName)
        }

        return styleString
    }

    override fun toString(): String {
        return toString("")
    }

    fun getName(): String {
        if (styleName.isEmpty()) {
            styleName = defaultStyleName()
        }

        return styleName
    }

    fun getName(typeIdentifyName: String): String {
        return generateStyleName(typeIdentifyName)
    }

    abstract protected fun defaultStyleName(): String

    abstract protected fun generateStyleName(typeIdentifyName: String): String

    abstract protected fun generateStyleString(typeIdentifyName: String): String
}