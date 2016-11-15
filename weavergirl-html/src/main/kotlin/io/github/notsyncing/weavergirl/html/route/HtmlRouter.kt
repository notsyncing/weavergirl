package io.github.notsyncing.weavergirl.html.route

import io.github.notsyncing.weavergirl.html.view.HtmlWindow
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import kotlin.browser.window

object HtmlRouter {
    class RouteMapper {
        infix fun String.to(pageCreator: () -> Page) {
            registerRoute(this, pageCreator)
        }
    }

    private val routes: MutableMap<String, () -> Page> = mutableMapOf()
    private lateinit var gotoPageHandler: (Page, String) -> Unit
    private lateinit var currentWindow: HtmlWindow

    private fun applyState(state: RouteState) {
        if (routes.containsKey(state.url)) {
            gotoPageHandler(routes[state.url]!!(), state.url)
        }
    }

    fun init(window: HtmlWindow) {
        val w = window.nativeWindow
        currentWindow = window

        w.onpopstate = l@ {
            val s = it.asDynamic().state

            if (s == null) {
                return@l null
            }

            window.prevPage()
            return@l true
        }

        if (w.history.state == null) {
            if (w.location.pathname != "/") {
                goto(w.location.pathname)
            } else {
                goto("/")
            }
        } else if (w.history.state is RouteState) {
            applyState(w.history.state as RouteState)
        } else {
            goto("/")
        }
    }

    fun registerRoute(url: String, pageCreator: () -> Page) {
        routes[url] = pageCreator
    }

    fun routes(m: RouteMapper.() -> Unit) {
        RouteMapper().m()
    }

    fun onGoToPage(handler: (Page, String) -> Unit) {
        gotoPageHandler = handler
    }

    fun hasRoute(url: String) = routes.containsKey(url)

    fun goto(url: String) {
        if (!hasRoute(url)) {
            console.error("Route $url is not registered!")
        }

        gotoPageHandler(routes[url]!!(), url)
    }
}