package io.github.notsyncing.weavergirl.test

import io.github.notsyncing.weavergirl.WeavergirlApp
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.view.HtmlWindow
import kotlin.browser.window

class TestApp : WeavergirlApp(HtmlWindow()) {
    override fun beforeStart() {
        super.beforeStart()

        HtmlRouter.routes {
            "/" to { IndexPage() }
            "/page1" to { TestPage1() }
        }
    }
}

fun main(args: Array<String>) {
    val app = TestApp()
    app.start()
}