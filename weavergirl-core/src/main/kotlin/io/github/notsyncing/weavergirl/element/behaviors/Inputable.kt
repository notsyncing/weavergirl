package io.github.notsyncing.weavergirl.element.behaviors

import io.github.notsyncing.weavergirl.watchable.Watchable

interface Inputable<T> {
    val value: Watchable<T>
}