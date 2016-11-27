package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestB : HtmlPage() {
    override fun content() = html {
        div {
            text("I'm test page B!")
        }
    }
}