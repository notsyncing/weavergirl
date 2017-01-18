package io.github.notsyncing.weavergirl.html.style

enum class HtmlSizeType {
    ViewHeight,
    ViewWidth,
    Pixel,
    Percentage,
    FontSize,
    RootFontSize,
    Auto,
    Inherit
}

class HtmlSize(val value: Double, val type: HtmlSizeType) : HtmlStyleRule() {
    companion object {
        val auto = HtmlSize(0.0, HtmlSizeType.Auto)
        val inherit = HtmlSize(0.0, HtmlSizeType.Inherit)
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
            HtmlSizeType.RootFontSize -> "rem"
            HtmlSizeType.Auto -> "auto"
            HtmlSizeType.Inherit -> "inherit"
        }

        return "$value$unit"
    }
}

val Number.px get() = HtmlSize(this.toDouble(), HtmlSizeType.Pixel)
val Number.vh get() = HtmlSize(this.toDouble(), HtmlSizeType.ViewHeight)
val Number.vw get() = HtmlSize(this.toDouble(), HtmlSizeType.ViewWidth)
val Number.em get() = HtmlSize(this.toDouble(), HtmlSizeType.FontSize)
val Number.rem get() = HtmlSize(this.toDouble(), HtmlSizeType.RootFontSize)
val Number.percent get() = HtmlSize(this.toDouble(), HtmlSizeType.Percentage)

var FabricHtmlElementStyle.height: HtmlSize
    get() = dimGetterSize("height")
    set(value) { dimSetterSize("height", value) }

var FabricHtmlElementStyle.width: HtmlSize
    get() = dimGetterSize("width")
    set(value) { dimSetterSize("width", value) }

class HtmlMargin(val top: HtmlSize, val right: HtmlSize, val bottom: HtmlSize, val left: HtmlSize) : HtmlStyleRule() {
    companion object {
        val auto = HtmlMargin(HtmlSize.auto)
        val inherit = HtmlMargin(HtmlSize.inherit)
    }

    constructor(top: HtmlSize, leftRight: HtmlSize, bottom: HtmlSize) : this(top, leftRight, leftRight, bottom)

    constructor(topBottom: HtmlSize, leftRight: HtmlSize) : this(topBottom, leftRight, topBottom, leftRight)

    constructor(size: HtmlSize) : this(size, size)

    override fun toString(): String {
        if ((left == right) && (left == top) && (top == bottom)) {
            return left.toString()
        } else if ((left == right) && (top == bottom)) {
            return "$top $left"
        } else if (left == right) {
            return "$top $left $bottom"
        } else {
            return "$top $right $bottom $left"
        }
    }
}

var FabricHtmlElementStyle.margin: HtmlMargin
    get() = (styles["margin"] as? HtmlMargin) ?: HtmlMargin.auto
    set(value) { styles["margin"] = value }

var FabricHtmlElementStyle.marginLeft: HtmlSize
    get() = dimGetterSize("margin-left")
    set(value) { dimSetterSize("margin-left", value) }

var FabricHtmlElementStyle.marginRight: HtmlSize
    get() = dimGetterSize("margin-right")
    set(value) { dimSetterSize("margin-right", value) }

var FabricHtmlElementStyle.marginTop: HtmlSize
    get() = dimGetterSize("margin-top")
    set(value) { dimSetterSize("margin-top", value) }

var FabricHtmlElementStyle.marginBottom: HtmlSize
    get() = dimGetterSize("margin-bottom")
    set(value) { dimSetterSize("margin-bottom", value) }