package io.github.notsyncing.weavergirl.html.style

class HtmlBorderWidth(val top: String, val right: String, val bottom: String, val left: String) : HtmlStyleRule() {
    companion object {
        val auto = HtmlBorderWidth(HtmlSize.auto)
    }

    constructor(top: String, leftRight: String, bottom: String) : this(top, leftRight, bottom, leftRight)

    constructor(topBottom: String, leftRight: String) : this(topBottom, leftRight, topBottom, leftRight)

    constructor(size: String) : this(size, size)

    constructor(top: HtmlSize, right: HtmlSize, bottom: HtmlSize, left: HtmlSize)
            : this(top.toString(), right.toString(), bottom.toString(), left.toString())

    constructor(top: HtmlSize, leftRight: HtmlSize, bottom: HtmlSize)
            : this(top.toString(), leftRight.toString(), bottom.toString())

    constructor(topBottom: HtmlSize, leftRight: HtmlSize) : this(topBottom.toString(), leftRight.toString())

    constructor(size: HtmlSize) : this(size.toString())

    override fun toString(): String {
        if ((left == right) && (left == top) && (top == bottom)) {
            return left
        } else if ((left == right) && (top == bottom)) {
            return "$top $left"
        } else if (left == right) {
            return "$top $left $bottom"
        } else {
            return "$top $right $bottom $left"
        }
    }
}

class HtmlBorderStyle(val top: String, val right: String, val bottom: String, val left: String) : HtmlStyleRule() {
    companion object {
        val none = HtmlBorderStyle(C.none)
    }

    constructor(top: String, leftRight: String, bottom: String) : this(top, leftRight, bottom, leftRight)

    constructor(topBottom: String, leftRight: String) : this(topBottom, leftRight, topBottom, leftRight)

    constructor(style: String) : this(style, style)

    override fun toString(): String {
        if ((left == right) && (left == top) && (top == bottom)) {
            return left
        } else if ((left == right) && (top == bottom)) {
            return "$top $left"
        } else if (left == right) {
            return "$top $left $bottom"
        } else {
            return "$top $right $bottom $left"
        }
    }
}

class HtmlBorder(val width: HtmlBorderWidth, val style: HtmlBorderStyle, val color: HtmlColor) : HtmlStyleRule() {
    companion object {
        val none = HtmlBorder(HtmlBorderWidth(HtmlSize.auto), HtmlBorderStyle.none, HtmlColor.auto)
    }

    override fun toString(): String {
        if (this == none) {
            return C.none
        }

        return "$width $style $color"
    }
}

var FabricHtmlElementStyle.borderRadius: HtmlSize
    get() = dimGetterSize("border-radius")
    set(value) { dimSetterSize("border-radius", value) }

var FabricHtmlElementStyle.borderWidth: HtmlBorderWidth
    get() = (styles["border-width"] as? HtmlBorderWidth) ?: HtmlBorderWidth.auto
    set(value) { styles["border-width"] = value }

var FabricHtmlElementStyle.borderStyle: HtmlBorderWidth
    get() = (styles["border-width"] as? HtmlBorderWidth) ?: HtmlBorderWidth.auto
    set(value) { styles["border-width"] = value }

var FabricHtmlElementStyle.borderColor: HtmlColor
    get() = dimGetterColor("border-color")
    set(value) { dimSetterColor("border-color", value) }