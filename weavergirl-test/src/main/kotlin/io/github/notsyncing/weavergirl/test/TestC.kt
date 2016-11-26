package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.a
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestC : HtmlPage() {
    override fun content() = html {
        div {
            text("I'm test page C!")
        }

        div {
            a(href = "/page2") {
                text("Goto test page 2")
            }
        }
    }
}