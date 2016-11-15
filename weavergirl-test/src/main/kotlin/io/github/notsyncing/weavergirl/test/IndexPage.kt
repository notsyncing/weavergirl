package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.a
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.view.Page
import org.w3c.dom.HTMLElement
import io.github.notsyncing.weavergirl.html.view.HtmlPage

class IndexPage : HtmlPage() {
    override fun content() = html {
        div {
            div {
                text("Hello, world!")
            }

            a(href = "http://www.baidu.com/") {
                text("External link")
            }

            a(href = "/page1") {
                text("Internal link")
            }
        }
    }
}