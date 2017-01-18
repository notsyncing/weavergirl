package io.github.notsyncing.weavergirl.html.style

abstract class HtmlStyleRule {
    var _important = false

    fun <T: HtmlStyleRule> important(): T {
        this._important = true

        return this as T
    }
}