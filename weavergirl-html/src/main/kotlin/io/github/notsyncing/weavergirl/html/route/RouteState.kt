package io.github.notsyncing.weavergirl.html.route

data class RouteState(val index: Int, val url: String) {
    companion object {
        fun from(o: dynamic): RouteState? {
            if (o == null) {
                return null
            }

            return RouteState((o.counter ?: o.index) ?: return null,
                    o.url ?: return null)
        }
    }
}