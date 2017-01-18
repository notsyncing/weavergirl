package io.github.notsyncing.weavergirl.html.style

class HtmlColor(val r: Int, val g: Int, val b: Int, val a: Float) : HtmlStyleRule() {
    companion object {
        val auto = HtmlColor(0, 0, 0, 0.0f)
    }

    override fun toString(): String {
        if (a >= 1.0f) {
            return "rgb($r, $g, $b)"
        } else {
            return "rgba($r, $g, $b, $a)"
        }
    }
}

fun rgb(r: Int, g: Int, b: Int) = HtmlColor(r, g, b, 1.0f)

fun rgba(r: Int, g: Int, b: Int, a: Float) = HtmlColor(r, g, b, a)

fun Int.color(): HtmlColor {
    val r = this and 0xff0000 shr 16
    val g = this and 0x00ff00 shr 8
    val b = this and 0x0000ff

    return HtmlColor(r, g, b, 1.0f)
}

private fun FabricHtmlElementStyle.dimGetter(name: String): HtmlColor {
    return (styles[name] as? HtmlColor?) ?: HtmlColor.auto
}

private fun FabricHtmlElementStyle.dimSetter(name: String, value: HtmlColor) {
    styles[name] = value
}

var FabricHtmlElementStyle.color: HtmlColor
    get() = dimGetter("color")
    set(value) { dimSetter("color", value) }

var FabricHtmlElementStyle.backgroundColor: HtmlColor
    get() = dimGetter("background-color")
    set(value) { dimSetter("background-color", value) }