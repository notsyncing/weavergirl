package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.a
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestPage1 : HtmlPage() {
    override fun content() = html {
        div {
            text("I'm test page 1!")
        }

        a(href = "/") {
            text("Back")
        }
    }
}