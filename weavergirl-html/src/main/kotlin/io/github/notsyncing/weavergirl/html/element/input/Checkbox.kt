package io.github.notsyncing.weavergirl.html.element.input

import io.github.notsyncing.weavergirl.watchable.Watchable

class Checkbox : Input<String>(InputType.Checkbox) {
    val checked: Watchable<Boolean> = Watchable(nativeElement.checked)

    init {
        nativeElement.addEventListener("change", {
            checked.set(nativeElement.checked)
        })
    }

    override fun convertValue(v: String): String = v
}