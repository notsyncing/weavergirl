package io.github.notsyncing.weavergirl.html.route

import io.github.notsyncing.weavergirl.view.Page

class RouteTreeBuilder {
    private lateinit var rootRoute: Route
    private lateinit var currentRoute: Route
    private lateinit var parentRoute: Route

    protected val empty: () -> Page = { throw RuntimeException("You should not see this!") }

    infix fun String.to(pageCreator: () -> Page): RouteTreeBuilder {
        if (this == "/") {
            rootRoute = Route(this, pageCreator, mutableListOf())
            currentRoute = rootRoute
        } else {
            currentRoute = Route(this, pageCreator, mutableListOf())
            parentRoute.children.add(currentRoute)
        }

        return this@RouteTreeBuilder
    }

    infix fun inner(subRoutes: RouteTreeBuilder.() -> Unit) {
        parentRoute = currentRoute
        this.subRoutes()
    }

    fun build() = rootRoute
}