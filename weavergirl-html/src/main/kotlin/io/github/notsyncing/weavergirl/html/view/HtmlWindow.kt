package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.route.ResolvedRoute
import io.github.notsyncing.weavergirl.html.route.Route
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.Document
import org.w3c.dom.HTMLBodyElement
import org.w3c.dom.HTMLElement
import kotlin.dom.clear

open class HtmlWindow : Window() {
    val nativeWindow: org.w3c.dom.Window = kotlin.browser.window
    val document: Document = nativeWindow.document

    private val body: HTMLElement
        get() = document.body!!

    private val pageStack: MutableList<Pair<HtmlPage, ResolvedRoute>> = mutableListOf()
    private val navRootMap: MutableMap<String, HTMLElement> = mutableMapOf()

    val currentPageIndex: Int
        get() = pageStack.lastIndex

    init {
        HtmlRouter.onGoToPage { p, r -> toPage(p, false, r) }

        navRootMap["/"] = body
    }

    override fun init() {
        HtmlRouter.init(this)
    }

    private fun attachPageToCurrentNavRoot(page: HtmlPage, navRoots: List<String>) {
        val currentNavRoot = navRootMap[navRoots.lastOrNull() ?: "/"] ?: body

        console.info("Current nav root: $currentNavRoot, page nav roots: ${JSON.stringify(navRoots)}")

        if (currentNavRoot is HTMLBodyElement) {
            console.info("Current nav root is body, replace it")
            document.body?.clear()
            document.body = page.toDom().nativeElement as HTMLElement
        } else {
            console.info("Current nav root is not body, append to it")
            currentNavRoot.clear()
            currentNavRoot.append(*page.children())
        }
    }

    private fun setCurrentPage(page: HtmlPage, navRoots: List<String>) {
        makeSureNavRoots(navRoots)

        currentPage = page
        attachPageToCurrentNavRoot(page, navRoots)
    }

    private fun makeSureNavRoots(navRoots: List<String>) {
        console.info("Make sure nav roots: ${JSON.stringify(navRoots)}")

        var currRoute: Route? = null

        for (r in navRoots) {
            if (navRootMap.containsKey(r)) {
                console.info("Nav root $r already exists, skip")
                continue
            }

            currRoute = HtmlRouter.findRoute(currRoute, r)

            if (currRoute == null) {
                throw RuntimeException("Parent route $r of $navRoots not found!")
            }

            val page = currRoute.pageCreator() as HtmlPage
            page.init(this, document.createElement("body"))

            attachPageToCurrentNavRoot(page, listOf(r))
        }
    }

    fun toPage(page: Page, replaceCurrent: Boolean, route: ResolvedRoute) {
        val p = page as HtmlPage
        p.init(this, document.createElement("body"))

        if (replaceCurrent) {
            pageStack[pageStack.lastIndex] = Pair(p, route)
        } else {
            pageStack.add(Pair(p, route))
        }

        setCurrentPage(p, route.parents)

        if (p.navRootElement !is HTMLBodyElement) {
            navRootMap[route.name] = p.navRootElement

            HtmlRouter.goto(p.navRootDefaultRoute)
        }
    }

    override fun toPage(url: String, replaceCurrent: Boolean) {
        val resolved = HtmlRouter.resolve(url)

        if (resolved == null) {
            throw RuntimeException("No route for $url")
        }

        toPage(resolved.pageCreator(), replaceCurrent, resolved)
    }

    override fun prevPage(distance: Int) {
        console.info("Page stack size ${pageStack.size}, back distance $distance")

        if (pageStack.size <= distance) {
            return
        }

        var p: HtmlPage? = null
        var r: ResolvedRoute? = null

        (1..distance).forEach {
            pageStack.removeAt(pageStack.lastIndex)

            val (a, b) = pageStack.last()
            p = a
            r = b
        }

        setCurrentPage(p!!, r!!.parents)
    }
}