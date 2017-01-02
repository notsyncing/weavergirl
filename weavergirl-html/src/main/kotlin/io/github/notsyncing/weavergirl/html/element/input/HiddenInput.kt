package io.github.notsyncing.weavergirl.html.element.input

class HiddenInput : Input<String>(InputType.Hidden) {
    override fun convertValue(v: String) = v
}
