package io.github.notsyncing.weavergirl

import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import kotlin.reflect.KClass

open class WeavergirlApp(val currentWindow: Window) {
    fun start() {
        beforeStart()

        currentWindow.init()
    }

    open fun beforeStart() {

    }
}