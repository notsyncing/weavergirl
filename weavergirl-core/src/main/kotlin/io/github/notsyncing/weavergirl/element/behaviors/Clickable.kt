package io.github.notsyncing.weavergirl.element.behaviors

import io.github.notsyncing.weavergirl.watchable.Watchable

interface Clickable {
    val clicked: Watchable<String>
}