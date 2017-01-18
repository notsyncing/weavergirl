package io.github.notsyncing.weavergirl.html.style

enum class HtmlSizeType {
    ViewHeight,
    ViewWidth,
    Pixel,
    Percentage,
    FontSize,
    Auto
}

class HtmlSize(val value: Double, val type: HtmlSizeType) : HtmlStyleRule() {
    companion object {
        val auto = HtmlSize(0.0, HtmlSizeType.Auto)
    }

    override fun toString(): String {
        if (type == HtmlSizeType.Auto) {
            return "auto"
        }

        val unit = when (type) {
            HtmlSizeType.ViewHeight -> "vh"
            HtmlSizeType.ViewWidth -> "vw"
            HtmlSizeType.Pixel -> "px"
            HtmlSizeType.Percentage -> "%"
            HtmlSizeType.FontSize -> "em"
            HtmlSizeType.Auto -> "auto"
        }

        return "$value$unit"
    }
}

val Number.px get() = HtmlSize(this.toDouble(), HtmlSizeType.Pixel)
val Number.vh get() = HtmlSize(this.toDouble(), HtmlSizeType.ViewHeight)
val Number.vw get() = HtmlSize(this.toDouble(), HtmlSizeType.ViewWidth)
val Number.em get() = HtmlSize(this.toDouble(), HtmlSizeType.FontSize)
val Number.percent get() = HtmlSize(this.toDouble(), HtmlSizeType.Percentage)

private fun FabricHtmlElementStyle.dimGetter(name: String): HtmlSize {
    return (styles[name] as? HtmlSize?) ?: HtmlSize.auto
}

private fun FabricHtmlElementStyle.dimSetter(name: String, value: HtmlSize) {
    styles[name] = value
}

var FabricHtmlElementStyle.height: HtmlSize
    get() = dimGetter("height")
    set(value) { dimSetter("height", value) }

var FabricHtmlElementStyle.width: HtmlSize
    get() = dimGetter("width")
    set(value) { dimSetter("width", value) }