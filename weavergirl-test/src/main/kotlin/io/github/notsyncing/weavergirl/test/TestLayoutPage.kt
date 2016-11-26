package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.a
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class TestLayoutPage : HtmlPage() {
    override fun content() = html {
        div {
            text("I'm test layout!")

            a(href = "/layout/a") {
                text("Goto A")
            }

            a(href = "/layout/b") {
                text("Goto B")
            }

            a(href = "/layout/c") {
                text("Goto C")
            }
        }

        div {
            navRoot("/layout/a")
        }

        a(href = "/") {
            text("Back")
        }
    }
}