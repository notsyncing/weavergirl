package io.github.notsyncing.weavergirl.html.element

import io.github.notsyncing.weavergirl.element.FabricElement
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.browser.document
import kotlin.dom.removeFromParent

open class FabricHtmlElement<T: Node>(nativeElement: T) : FabricElement<T>(nativeElement) {
    constructor(nativeElementTagName: String) : this(document.createElement(nativeElementTagName) as T)

    override fun append(elem: FabricElement<*>) {
        super.append(elem)

        nativeElement.appendChild(elem.nativeElement as Node)
    }

    override fun insertInto(elem: FabricElement<*>) {
        super.insertInto(elem)

        (elem.nativeElement as HTMLElement).appendChild(nativeElement)
    }

    override fun remove() {
        super.remove()

        nativeElement.removeFromParent()
    }

    fun <E: FabricElement<*>> createChild(creator: () -> E, inner: (E.() -> Unit)? = null, conf: ((E) -> Unit)? = null): E {
        val e = creator()
        conf?.invoke(e)

        append(e)

        if (inner != null) {
            e.inner()
        }

        return e
    }
}