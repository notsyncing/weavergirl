package io.github.notsyncing.weavergirl.html

object Polyfills {
    private fun cssPolyfills() {
        js("""
            if (!CSSStyleSheet.prototype.insertRule) {
                CSSStyleSheet.prototype.insertRule = CSSStyleSheet.prototype.addRule;
                CSSStyleSheet.prototype.deleteRule = CSSStyleSheet.prototype.removeRule;
            }
        """)
    }

    fun polyfill() {
        cssPolyfills()
    }
}