package io.github.notsyncing.weavergirl.html.element.input

class Radio(value: Any) : Input(InputType.Radio) {
    init {
        this.value = value.toString()
    }
}
