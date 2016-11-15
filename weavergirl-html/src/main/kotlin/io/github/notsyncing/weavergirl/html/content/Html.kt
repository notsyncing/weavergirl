package io.github.notsyncing.weavergirl.html.content

import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.view.Page
import io.github.notsyncing.weavergirl.view.Window
import io.github.notsyncing.weavergirl.html.view.HtmlPage

fun Page.html(body: FabricHtmlElement<*>.() -> Unit): Page.() -> Unit {
    return {
        val htmlPage = this as HtmlPage
        htmlPage.rootElement.body()
    }
}