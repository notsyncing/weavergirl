package io.github.notsyncing.weavergirl

import io.github.notsyncing.weavergirl.view.Window

open class WeavergirlApp(val currentWindow: Window) {
    fun start() {
        beforeStart()

        currentWindow.init()

        console.info("App started in window $currentWindow")
    }

    open fun beforeStart() {

    }
}