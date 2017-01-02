package io.github.notsyncing.weavergirl.html.element.input

class PasswordInput : Input<String>(InputType.Password) {
    override fun convertValue(v: String) = v
}
