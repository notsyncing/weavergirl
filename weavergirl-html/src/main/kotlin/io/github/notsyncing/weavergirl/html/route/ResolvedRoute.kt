package io.github.notsyncing.weavergirl.html.route

import io.github.notsyncing.weavergirl.view.Page

class ResolvedRoute(val pageCreator: () -> Page, val name: String,
                    val parents: List<String>,
                    val params: Parameters,
                    val rawUrl: String? = null) {
    val path: String by lazy<String> {
        if (rawUrl != null) {
            return@lazy rawUrl
        }

        if (parents.isEmpty()) {
            return@lazy "/"
        }

        val s = parents.joinToString("/") + "/$name"

        if (s.startsWith("//")) {
            return@lazy s.substring(1)
        } else {
            return@lazy s
        }
    }
}