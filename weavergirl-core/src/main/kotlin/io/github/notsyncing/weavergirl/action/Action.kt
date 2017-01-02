package io.github.notsyncing.weavergirl.action

import io.github.notsyncing.weavergirl.watchable.Watchable

class Action(val name: String, val inner: Action.() -> Unit) {
    init {
        this.inner()
    }

    fun triggerOn(trigger: Watchable<*>): Action {
        return this
    }
}