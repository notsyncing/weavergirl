package io.github.notsyncing.weavergirl.html.style

import io.github.notsyncing.weavergirl.style.FabricElementStyle

open class FabricHtmlElementStyle(name: String) : FabricElementStyle(name) {
    companion object {
        fun build(name: String, inner: FabricHtmlElementStyle.() -> Unit): FabricHtmlElementStyle {
            val o = object : FabricHtmlElementStyle(name) {}
            o.inner()
            return o
        }
    }

    override fun defaultStyleName(): String {
        return "style-${this.hashCode()}"
    }

    override fun generateStyleName(typeIdentifyName: String): String {
        return ".${getName()}${if (typeIdentifyName.isNotEmpty()) "[we-$typeIdentifyName]" else ""}"
    }

    override fun generateStyleString(typeIdentifyName: String): String {
        val buf = StringBuilder()

        buf.append(generateStyleName(typeIdentifyName))
                .append("{\n")
                .append(styles.entries.map {
                    val important = if ((it.value is HtmlStyleRule) && ((it.value as HtmlStyleRule)._important)) {
                        " !important"
                    } else {
                        ""
                    }

                    "${it.key}: ${it.value}$important;"
                }
                        .joinToString("\n"))
                .append("\n}")

        return buf.toString()
    }
}

fun htmlStyle(name: String = "", inner: FabricHtmlElementStyle.() -> Unit): FabricHtmlElementStyle {
    return FabricHtmlElementStyle.build(name, inner)
}