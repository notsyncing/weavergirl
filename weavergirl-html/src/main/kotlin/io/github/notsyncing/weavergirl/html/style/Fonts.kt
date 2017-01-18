package io.github.notsyncing.weavergirl.html.style

var FabricHtmlElementStyle.fontSize: HtmlSize
    get() = dimGetterSize("font-size")
    set(value) { dimSetterSize("font-size", value) }