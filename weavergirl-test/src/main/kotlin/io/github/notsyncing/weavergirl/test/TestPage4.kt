package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.a
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestPage4 : HtmlPage() {
    override fun content() = html {
        div {
            text("I'm test page 4: parameter is ")
        }

        a(href = "/") {
            text("Back")
        }
    }
}