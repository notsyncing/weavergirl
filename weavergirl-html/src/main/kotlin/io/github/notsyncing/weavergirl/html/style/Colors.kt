package io.github.notsyncing.weavergirl.html.style

class HtmlColor(val r: Int, val g: Int, val b: Int, val a: Float) : HtmlStyleRule() {
    companion object {
        val auto = HtmlColor(0, 0, 0, 0.0f)

        val white = HtmlColor("white")
        val black = HtmlColor("black")
        val gray = HtmlColor("gray")

        val red = HtmlColor("red")
        val green = HtmlColor("green")
        val blue = HtmlColor("blue")

        val transparent = HtmlColor("transparent")
    }

    private var colorName: String = ""

    constructor(color: String) : this(0, 0, 0, 0.0f) {
        this.colorName = color
    }

    override fun toString(): String {
        if (colorName.isNotEmpty()) {
            return colorName
        }

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

var FabricHtmlElementStyle.color: HtmlColor
    get() = dimGetterColor("color")
    set(value) { dimSetterColor("color", value) }

var FabricHtmlElementStyle.backgroundColor: HtmlColor
    get() = dimGetterColor("background-color")
    set(value) { dimSetterColor("background-color", value) }