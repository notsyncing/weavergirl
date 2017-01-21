package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.html.layout.HtmlLayout
import org.w3c.dom.Element
import kotlin.dom.addClass
import kotlin.dom.removeClass

abstract class FabricHtmlElement<T: Element>(private val tagName: String) : FabricHtmlNodeElement<T>() {
    override var id: String
        get() = nativeElement.id
        set(value) {
            nativeElement.id = value
        }

    val classes: List<String>
        get() = nativeElement.className.split(" ")

    private var nativeElementInitialized = false

    init {
        if (tagName.isNotEmpty()) {
            nativeElement = HtmlLayout.raw(tagName)
            initNativeElement()
        }
    }

    constructor(nativeElement: T) : this("") {
        this.nativeElement = nativeElement
    }

    constructor() : this("")

    private fun initNativeElement() {
        if (nativeElementInitialized) {
            return
        }

        nativeElementInitialized = true

        nativeElement.setAttribute("we-$typeIdentityName", "")
    }

    override fun setNativeElement(nativeElement: Any) {
        super.setNativeElement(nativeElement)

        initNativeElement()
    }

    override fun layout() = HtmlLayout {
        slot.make(this@FabricHtmlElement)
    }

    fun addClass(vararg name: String) {
        nativeElement.addClass(*name)
    }

    fun removeClass(vararg name: String) {
        nativeElement.removeClass(*name)
    }

    infix fun classes(list: String) {
        addClass(*list.split(" ").toTypedArray())
    }
}