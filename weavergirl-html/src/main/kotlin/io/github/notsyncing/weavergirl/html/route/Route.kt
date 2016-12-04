package io.github.notsyncing.weavergirl.html.route

import io.github.notsyncing.kotlin.js.ext.browser.decodeURIComponent
import io.github.notsyncing.weavergirl.route.Parameters
import io.github.notsyncing.weavergirl.view.Page

class Route(val pattern: String, val pageCreator: () -> Page,
            val children: MutableList<Route>) {
    private fun parseQueryString(qs: String): Parameters {
        val params = Parameters()
        val pairs = qs.split("&")

        for (p in pairs) {
            val pp = p.split("=")

            if (pp.size <= 1) {
                continue
            }

            params.put(pp[0], decodeURIComponent(pp[1]))
        }

        return params
    }

    fun resolve(path: String): ResolvedRoute? {
        val qsi = path.indexOf("?")
        var p = if (qsi >= 0) path.substring(0, qsi) else path

        if (p != "/") {
            p = p.removeSuffix("/")
        }

        val qs = if (qsi >= 0) path.substring(qsi + 1) else ""
        val parts = p.split("/")
        val params: Parameters

        console.info("Path: $p, query string: $qs, path: ${JSON.stringify(parts)}")

        if (qs.isNotEmpty()) {
            params = parseQueryString(qs)
        } else {
            params = Parameters()
        }

        if ((p == "/") && (pattern == "/")) {
            return ResolvedRoute(pageCreator, pattern, emptyList(), params, path)
        }

        var currRoute = this
        val l = parts.subList(1, parts.size).toMutableList()
        val parents = mutableListOf(this.pattern)
        var currIndex = 0

        while (currIndex < l.size) {
            for (childRoute in currRoute.children) {
                val childRouteParts = childRoute.pattern.split("/")
                val childRouteParams = mutableListOf<Pair<String, String>>()
                var match = true
                var innerCurrIndex = currIndex

                for (childRoutePart in childRouteParts) {
                    if (childRoutePart == l[innerCurrIndex]) {
                        innerCurrIndex++
                    } else if (childRoutePart.startsWith(":")) {
                        childRouteParams.add(Pair(childRoutePart.substring(1), l[innerCurrIndex]))
                        innerCurrIndex++
                    } else {
                        match = false
                        break
                    }
                }

                if (match) {
                    childRouteParams.forEach { (k, v) ->
                        params.put(k, v)
                    }

                    currRoute = childRoute
                    currIndex = innerCurrIndex
                    parents.add(currRoute.pattern)
                    break
                }
            }
        }

        return ResolvedRoute(currRoute.pageCreator, parents.last(), parents.subList(0, parents.size - 1), params, path)
    }
}