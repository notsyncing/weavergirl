package io.github.notsyncing.weavergirl.html.route

import io.github.notsyncing.weavergirl.html.view.HtmlWindow
import io.github.notsyncing.weavergirl.view.Page
import kotlin.browser.window

object HtmlRouter {
    private lateinit var rootRoute: Route
    private lateinit var gotoPageHandler: (page: Page, route: ResolvedRoute) -> Unit
    private lateinit var currentWindow: HtmlWindow

    fun init(window: HtmlWindow) {
        val w = window.nativeWindow
        currentWindow = window

        w.onpopstate = l@ {
            val s = it.asDynamic().state

            if (s == null) {
                console.info("State popped, but state is null")
                return@l false
            }

            console.info("State popped: ${JSON.stringify(s)}")
            goto(RouteState.from(s) ?: return@l false)
            return@l true
        }

        if (w.history.state == null) {
            if (w.location.pathname != "/") {
                goto(w.location.pathname)
            } else {
                goto("/")
            }
        } else {
            val s = RouteState.from(w.history.state)

            if (s != null) {
                goto(s)
            } else {
                goto("/")
            }
        }
    }

    fun routes(m: RouteTreeBuilder.() -> Unit) {
        val b = RouteTreeBuilder()
        b.m()

        rootRoute = b.build()

        console.info("Routes: ")
        console.dir(rootRoute)
    }

    fun onGoToPage(handler: (Page, ResolvedRoute) -> Unit) {
        gotoPageHandler = handler
    }

    fun resolve(url: String): ResolvedRoute? {
        val host = "${window.location.protocol}//${window.location.host}"
        var path = url

        if (url.indexOf(host) == 0) {
            path = url.substring(host.length)
        }

        return rootRoute.resolve(path)
    }

    fun goto(url: String) {
        val resolved = resolve(url)

        if (resolved == null) {
            throw RuntimeException("Route $url is not registered!")
        }

        goto(resolved)
    }

    fun goto(state: RouteState) {
        if (currentWindow.currentPageIndex < 0) {
            goto(state.url)
            return
        }

        console.info("Current page index: ${currentWindow.currentPageIndex}, target state: ${JSON.stringify(state)}")

        if (state.index == currentWindow.currentPageIndex) {
            return
        } else if (state.index < currentWindow.currentPageIndex) {
            console.info("Go back")
            currentWindow.prevPage(currentWindow.currentPageIndex - state.index)
        } else {
            console.info("Go forward")
            goto(state.url)
        }
    }

    fun goto(route: ResolvedRoute) {
        console.info("Resolved route: ${route.path}, params: ${route.params}")
        console.dir(route)

        gotoPageHandler(route.pageCreator(), route)
        currentWindow.nativeWindow.history.pushState(RouteState(currentWindow.currentPageIndex, route.path), "",
                route.path)
    }

    fun findRoute(parentRoute: Route?, name: String): Route? {
        val currRoute = parentRoute ?: rootRoute

        if ((name == "/") && (currRoute == rootRoute)) {
            return rootRoute
        }

        return currRoute.children.firstOrNull { it.pattern == name }
    }
}