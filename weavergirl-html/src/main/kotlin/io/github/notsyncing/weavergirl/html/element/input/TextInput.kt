package io.github.notsyncing.weavergirl.html.element.input

class TextInput : Input<String>(InputType.Text) {
    override fun convertValue(v: String) = v
}
