package io.github.notsyncing.weavergirl.test.elements

import io.github.notsyncing.weavergirl.element.behaviors.Clickable
import io.github.notsyncing.weavergirl.events.Clicked
import io.github.notsyncing.weavergirl.events.ViewDidEnter
import io.github.notsyncing.weavergirl.events.ViewWillEnter
import io.github.notsyncing.weavergirl.html.element.Div

open class CustomElement1 : Div(), Clickable, ViewWillEnter, ViewDidEnter, Clicked {
    override fun viewWillEnter() {
        console.info("I'm going to enter this window!")
    }

    override fun viewDidEnter() {
        console.info("I entered this window!")
    }

    override fun onClick() {
        console.info("Clicked me!")
    }
}

