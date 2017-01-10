package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.style.height
import io.github.notsyncing.weavergirl.html.style.htmlStyle
import io.github.notsyncing.weavergirl.html.style.px
import io.github.notsyncing.weavergirl.html.style.width
import io.github.notsyncing.weavergirl.watchable.Watchable

open class CustomElement1 : Div(), Clickable, ViewWillEnter, ViewDidEnter {
    override val clicked: Watchable<String> = Watchable()

    init {
        clicked.onFired { console.info("I'm clicked!") }

        styles add htmlStyle("custom-elem") {
            height = 200.px
            width = auto
        }
    }

    override fun viewWillEnter() {
        console.info("I'm going to enter this window!")
    }

    override fun viewDidEnter() {
        console.info("I entered this window!")
    }
}

