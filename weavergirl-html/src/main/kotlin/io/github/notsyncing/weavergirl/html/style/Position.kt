package io.github.notsyncing.weavergirl.html.style

class HtmlFloat(val float: String) : HtmlStyleRule() {
    companion object {
        val left = HtmlFloat("left")
        val right = HtmlFloat("right")
        val none = HtmlFloat("none")
        val inherit = HtmlFloat("inherit")
    }

    override fun toString(): String {
        return float
    }
}

var FabricHtmlElementStyle.float: HtmlFloat
    get() = (styles["float"] as? HtmlFloat) ?: HtmlFloat.none
    set(value) { styles["float"] = value }

var FabricHtmlElementStyle.clear: HtmlFloat
    get() = (styles["clear"] as? HtmlFloat) ?: HtmlFloat.none
    set(value) { styles["clear"] = value }