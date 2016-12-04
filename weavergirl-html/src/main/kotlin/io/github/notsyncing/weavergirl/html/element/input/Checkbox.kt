package io.github.notsyncing.weavergirl.html.element.input

class Checkbox : Input(InputType.Checkbox) {
    var checked: Boolean
        get() = nativeElement.checked
        set(value) {
            nativeElement.checked = value
        }
}