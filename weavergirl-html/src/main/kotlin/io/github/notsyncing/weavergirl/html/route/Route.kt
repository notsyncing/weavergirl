package io.github.notsyncing.weavergirl.html.route

import io.github.notsyncing.weavergirl.view.Page

class Route(val pattern: String, val pageCreator: () -> Page,
            val children: MutableList<Route>) {
    private fun parseQueryString(qs: String): MutableMap<String, String> {
        val map: MutableMap<String, String> = mutableMapOf()
        val pairs = qs.split("&")

        for (p in pairs) {

        }

        return map
    }

    fun resolve(path: String): ResolvedRoute? {
        val qsi = path.indexOf("?")
        var p = if (qsi >= 0) path.substring(0, qsi) else path

        if (p != "/") {
            p = p.removeSuffix("/")
        }

        val qs = if (qsi >= 0) path.substring(qsi + 1) else ""
        val parts = p.split("/")
        val params: MutableMap<String, String>

        console.info("Path: $p, query string: $qs, path: ${JSON.stringify(parts)}")

        if (qs.isNotEmpty()) {
            params = parseQueryString(qs)
        } else {
            params = mutableMapOf()
        }

        if ((p == "/") && (pattern == "/")) {
            return ResolvedRoute(pageCreator, pattern, emptyList(), params)
        }

        var currRoute = this
        val l = parts.subList(1, parts.size).toMutableList()
        val parents = mutableListOf(this.pattern)

        while (!l.isEmpty()) {
            val currPart = l.removeAt(0)
            var r = currRoute.children.firstOrNull { it.pattern == currPart }

            if (r != null) {
                currRoute = r
                parents.add(currPart)
                continue
            } else {
                r = currRoute.children.firstOrNull { it.pattern.startsWith(":") }
            }

            if (r != null) {
                currRoute = r
                params[r.pattern.substring(1)] = currPart
                continue
            } else {
                r = currRoute.children.firstOrNull { it.pattern == "*" }
            }

            if (r != null) {
                currRoute = r
                continue
            } else {
                return null
            }
        }

        return ResolvedRoute(currRoute.pageCreator, parents.last(), parents.subList(0, parents.size - 1), params)
    }
}