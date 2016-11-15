package io.github.notsyncing.weavergirl.view

import org.w3c.dom.Document

abstract class Window {
    lateinit var currentPage: Page

    abstract fun init()

    abstract fun toPage(page: Page, replaceCurrent: Boolean)

    fun toPage(page: Page) {
        toPage(page, false)
    }

    abstract fun prevPage(distance: Int)

    fun prevPage() {
        prevPage(1)
    }
}
