package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.WeavergirlApp
import io.github.notsyncing.weavergirl.html.resource.css
import io.github.notsyncing.weavergirl.html.resource.javascript
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.view.HtmlWindow
import io.github.notsyncing.weavergirl.test.pages.*

class TestApp : WeavergirlApp(HtmlWindow()) {
    override fun beforeStart() {
        super.beforeStart()

        HtmlRouter.routes {
            "/" to { IndexPage() } inner {
                "page1" to { TestPage1() }
                "layout" to { TestLayoutPage() } inner {
                    "a" to { TestA() }
                    "b" to { TestB() }
                    "c" to { TestC() }
                }
                "page2" to { TestPage2() }
                "page3" to { TestPage3() }
                "page4/:id" to { TestPage4() }
            }
        }
    }

    override fun afterStart() {
        super.afterStart()

        currentWindow import javascript("node_modules/test.js")
        currentWindow import css("node_modules/test.css")
    }
}

fun main(args: Array<String>) {
    val app = TestApp()
    app.start()
}