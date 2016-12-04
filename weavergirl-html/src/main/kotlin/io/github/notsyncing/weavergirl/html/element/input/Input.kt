package io.github.notsyncing.weavergirl.html.element.input

import io.github.notsyncing.weavergirl.element.behaviors.Inputable
import io.github.notsyncing.weavergirl.html.element.FabricHtmlTagElement
import org.w3c.dom.HTMLInputElement

open class Input(val type: InputType) : FabricHtmlTagElement<HTMLInputElement>("input"), Inputable {
    override var value: Any?
        get() = nativeElement.value
        set(value) {
            nativeElement.value = value.toString()
        }

    init {
        nativeElement.type = inputTypeToString(type)
    }

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
