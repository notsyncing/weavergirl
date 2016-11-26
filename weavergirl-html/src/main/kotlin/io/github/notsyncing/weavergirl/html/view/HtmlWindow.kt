package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.route.ResolvedRoute
import io.github.notsyncing.weavergirl.html.route.Route
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.Document
import org.w3c.dom.HTMLElement
import kotlin.browser.window
import kotlin.dom.clear

open class HtmlWindow : Window() {
    val nativeWindow: org.w3c.dom.Window = kotlin.browser.window
    val document: Document = nativeWindow.document

    private val body: HTMLElement
        get() = document.body!!

    private val pageStack: MutableList<Pair<HtmlPage, ResolvedRoute>> = mutableListOf()
    private val navRootMap: MutableMap<String, HtmlPage> = mutableMapOf()

    val currentPageIndex: Int
        get() = pageStack.lastIndex

    init {
        HtmlRouter.onGoToPage { p, r -> toPage(p, false, r) }
    }

    override fun init() {
        window.onload = {
            val rootPage = HtmlRootPage()
            rootPage.init(this, document.body!!)

            navRootMap["/"] = rootPage

            HtmlRouter.init(this)
        }
    }

    private fun attachPageToNavRoot(page: HtmlPage, navRoot: String?) {
        val currentNavRoot = navRootMap[navRoot ?: "/"]!!

        console.info("Current nav root: $currentNavRoot")
        console.info(currentNavRoot.navRootElement.innerHTML)

        currentNavRoot.navRootElement.clear()

        page.children().forEach { currentNavRoot.navRootElement.appendChild(it) }

        console.info("After append: ")
        console.info(currentNavRoot.navRootElement.innerHTML)
    }

    private fun setCurrentPage(page: HtmlPage, navRoots: List<String>) {
        makeSureNavRoots(navRoots)

        console.info("Nav roots all present. attach page $page to nav root ${navRoots.lastOrNull()}")

        currentPage = page
        attachPageToNavRoot(page, navRoots.lastOrNull())
    }

    private fun makeSureNavRoots(navRoots: List<String>) {
        console.info("Make sure nav roots: ${JSON.stringify(navRoots)}")

        var currRoute: Route? = null

        navRoots.forEachIndexed { i, r ->
            if (i == 0) {
                return@forEachIndexed
            }

            if (!navRootMap.containsKey(r)) {
                currRoute = HtmlRouter.findRoute(currRoute, r)

                if (currRoute == null) {
                    throw RuntimeException("Parent route $r of $navRoots not found!")
                }

                val page = currRoute!!.pageCreator() as HtmlPage
                page.init(this, document.createElement("body"))
                attachPageToNavRoot(page, navRoots[i - 1])

                navRootMap[r] = page
                console.info("Page $page ($i) has nav root ${page.navRootElement}, mapped to $r")
            } else {
                val parentNavRoot = navRootMap[navRoots[i - 1]]!!
                val currNavRoot = navRootMap[r]!!

                parentNavRoot.navRootElement.clear()
                currNavRoot.children().forEach { parentNavRoot.navRootElement.appendChild(it) }
            }
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