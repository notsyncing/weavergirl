package io.github.notsyncing.weavergirl.test.pages

import io.github.notsyncing.weavergirl.html.content.html
import io.github.notsyncing.weavergirl.html.element.a
import io.github.notsyncing.weavergirl.html.element.div
import io.github.notsyncing.weavergirl.html.element.text
import io.github.notsyncing.weavergirl.html.view.HtmlPage
import io.github.notsyncing.weavergirl.test.elements.customElement1

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

            a(href = "/layout/a") {
                text("Layout link")
            }

            div {
                div {
                    a(href = "/page3?id=1") {
                        text("Parameter in querystring")
                    }
                }

                div {
                    a(href = "/page4/5") {
                        text("Parameter in url")
                    }
                }
            }
        }

        customElement1 {  }
    }
}