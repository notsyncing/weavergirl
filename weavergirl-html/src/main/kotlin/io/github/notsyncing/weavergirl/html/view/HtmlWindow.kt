package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.route.RouteState
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.Document
import org.w3c.dom.HTMLElement
import org.w3c.dom.Node
import kotlin.browser.window

open class HtmlWindow : Window() {
    val nativeWindow: org.w3c.dom.Window = kotlin.browser.window
    val document: Document = nativeWindow.document

    private val body: HTMLElement
        get() = document.body!!

    private val pageStack: MutableList<HtmlPage> = mutableListOf()

    init {
        HtmlRouter.onGoToPage { p, url -> toPage(p, false, url) }
    }

    override fun init() {
        HtmlRouter.init(this)
    }

    private fun setCurrentPage(page: HtmlPage) {
        currentPage = page
        document.body = page.toDom().nativeElement as HTMLElement
    }

    private fun toPage(page: Page, replaceCurrent: Boolean, url: String) {
        val p = page as HtmlPage
        p.init(this, document.createElement("body"))

        if (replaceCurrent) {
            pageStack[pageStack.size - 1] = p
        } else {
            pageStack.add(p)
            nativeWindow.history.pushState(RouteState(url), "", url)
        }

        setCurrentPage(p)
    }

    override fun toPage(page: Page, replaceCurrent: Boolean) {
        toPage(page, replaceCurrent, "")
    }

    override fun prevPage(distance: Int) {
        if (pageStack.size <= distance) {
            return
        }

        var p: HtmlPage? = null

        (1..distance).forEach { p = pageStack.removeAt(pageStack.size - 1) }

        setCurrentPage(p!!)
    }
}