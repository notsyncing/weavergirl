package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.view.Page

class HtmlRootPage : HtmlPage() {
    override fun content(): Page.() -> Unit {
        return html {}
    }
}