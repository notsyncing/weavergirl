package io.github.notsyncing.weavergirl.view

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
}
