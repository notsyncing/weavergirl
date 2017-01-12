package io.github.notsyncing.weavergirl.view

import io.github.notsyncing.weavergirl.resource.Resource

abstract class Window {
    lateinit var currentPage: Page

    abstract fun init()

    abstract fun toPage(url: String, replaceCurrent: Boolean)

    fun toPage(url: String) {
        toPage(url, false)
    }

    abstract fun prevPage(distance: Int)

    fun prevPage() {
        prevPage(1)
    }

    infix fun import(resource: Resource) {
        importResource(resource)
    }

    protected abstract fun importResource(resource: Resource)
}
