package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.html.element.Div
import io.github.notsyncing.weavergirl.html.style.*
import io.github.notsyncing.weavergirl.watchable.Watchable

open class CustomElement1 : Div(), Clickable, ViewWillEnter, ViewDidEnter {
    override val clicked: Watchable<String> = Watchable()

    init {
        clicked.onFired { console.info("I'm clicked!") }

        styles add htmlStyle("custom-elem") {
            height = 200.px
            width = HtmlSize.auto.important()

            color = rgb(255, 0, 0)
            backgroundColor = 0xdddddd.color()
        }
    }

    override fun viewWillEnter() {
        console.info("I'm going to enter this window!")
    }

    override fun viewDidEnter() {
        console.info("I entered this window!")
    }
}

