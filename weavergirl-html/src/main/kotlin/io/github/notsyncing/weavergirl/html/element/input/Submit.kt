package io.github.notsyncing.weavergirl.html.element.input

class Submit : Input<String>(InputType.Submit) {
    override fun convertValue(v: String) = v
}

