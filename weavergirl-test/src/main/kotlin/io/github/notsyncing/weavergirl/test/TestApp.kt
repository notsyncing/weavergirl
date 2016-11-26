package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.WeavergirlApp
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.view.HtmlWindow

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
            }
        }
    }
}

fun main(args: Array<String>) {
    val app = TestApp()
    app.start()
}