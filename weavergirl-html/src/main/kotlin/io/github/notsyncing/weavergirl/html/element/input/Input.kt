package io.github.notsyncing.weavergirl.html.element.input

import io.github.notsyncing.weavergirl.element.behaviors.Inputable
import io.github.notsyncing.weavergirl.html.element.FabricHtmlElement
import io.github.notsyncing.weavergirl.watchable.Watchable
import org.w3c.dom.HTMLInputElement

abstract class Input<T>(val type: InputType) : FabricHtmlElement<HTMLInputElement>("input"), Inputable<T> {
    override val value: Watchable<T> = Watchable(convertValue(nativeElement.value))

    init {
        nativeElement.type = inputTypeToString(type)

        nativeElement.addEventListener("change", {
            value.set(convertValue(nativeElement.value))
        })
    }

    abstract fun convertValue(v: String): T

    private fun inputTypeToString(type: InputType): String {
        var s = "text"

        when (type) {
            InputType.Text -> s = "text"
            InputType.Checkbox -> s = "checkbox"
            InputType.Password -> s = "password"
            InputType.Number -> s = "number"
            InputType.Radio -> s = "radio"
            InputType.File -> s = "file"
            InputType.Hidden -> s = "hidden"
            InputType.Submit -> s = "submit"
            InputType.Button -> s = "button"
        }

        return s
    }
}
