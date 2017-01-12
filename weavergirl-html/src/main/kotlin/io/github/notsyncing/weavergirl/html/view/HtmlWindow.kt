package io.github.notsyncing.weavergirl.html.view

import io.github.notsyncing.weavergirl.html.Polyfills
import io.github.notsyncing.weavergirl.html.resource.JavascriptResource
import io.github.notsyncing.weavergirl.html.resource.StylesheetResource
import io.github.notsyncing.weavergirl.html.route.HtmlRouter
import io.github.notsyncing.weavergirl.html.route.ResolvedRoute
import io.github.notsyncing.weavergirl.html.route.Route
import io.github.notsyncing.weavergirl.html.style.HtmlStyleManager
import io.github.notsyncing.weavergirl.resource.Resource
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.PageContext
import io.github.notsyncing.weavergirl.view.Window
import org.w3c.dom.Document
import org.w3c.dom.HTMLElement
import org.w3c.dom.HTMLScriptElement
import org.w3c.dom.HTMLLinkElement
import kotlin.browser.window

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
            HtmlStyleManager.init(this)

            val rootNavPage = HtmlRootPage()
            rootNavPage.init(this, null)

            navRootMap["/"] = rootNavPage

            HtmlRouter.init(this)
        }

        Polyfills.polyfill()

        if (document.head == null) {
            val head = document.createElement("head")
            document.appendChild(head)
        }
    }

    private fun attachPageToNavRoot(page: HtmlPage, navRoot: String?) {
        val currentNavRoot = navRootMap[navRoot ?: "/"]!!

        console.info("Current nav root: $currentNavRoot")
        console.info(currentNavRoot.navRootElement)

        currentNavRoot.navRootElement.clear()

        page.viewWillEnter()

        page.renderIn(currentNavRoot.navRootElement)

        page.viewDidEnter()

        console.info("After append: ")
        console.info(currentNavRoot.navRootElement)
    }

    private fun setCurrentPage(page: HtmlPage, route: ResolvedRoute) {
        makeSureNavRoots(route, page.context)

        console.info("Nav roots all present. attach page $page to nav root ${route.parents.lastOrNull()}")

        currentPage = page
        attachPageToNavRoot(page, route.parents.lastOrNull())
    }

    private fun makeSureNavRoots(route: ResolvedRoute, context: PageContext) {
        val navRoots = route.parents
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
                page.init(this, null)
                attachPageToNavRoot(page, navRoots[i - 1])

                navRootMap[r] = page
                console.info("Page $page ($i) has nav root ${page.navRootElement}, mapped to $r")
            } else {
                val parentNavRoot = navRootMap[navRoots[i - 1]]!!
                val currNavRoot = navRootMap[r]!!

                parentNavRoot.navRootElement.clear()
                currNavRoot.renderIn(parentNavRoot.navRootElement)
            }

            navRootMap[r]!!.context = context
        }
    }

    private fun toPage(page: Page, replaceCurrent: Boolean, route: ResolvedRoute) {
        val p = page as HtmlPage
        p.init(this, null)
        p.context = PageContext(route.params)

        if (replaceCurrent) {
            pageStack[pageStack.lastIndex] = Pair(p, route)
        } else {
            pageStack.add(Pair(p, route))
        }

        setCurrentPage(p, route)
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

        setCurrentPage(p!!, r!!)
    }

    private fun importJs(res: JavascriptResource) {
        val scriptElem = document.createElement("script") as HTMLScriptElement
        scriptElem.type = res.mimeType
        scriptElem.src = res.url

        document.head!!.appendChild(scriptElem)
    }

    private fun importCss(res: StylesheetResource) {
        val scriptElem = document.createElement("link") as HTMLLinkElement
        scriptElem.type = res.mimeType
        scriptElem.rel = "stylesheet"
        scriptElem.href = res.url

        document.head!!.appendChild(scriptElem)
    }

    override fun importResource(resource: Resource) {
        if (resource is JavascriptResource) {
            importJs(resource)
        } else if (resource is StylesheetResource) {
            importCss(resource)
        }
    }
}