package io.github.notsyncing.weavergirl.model

import io.github.notsyncing.kotlin.js.ext.Object
import io.github.notsyncing.kotlin.js.ext.ObjectPropertyAccessDescriptor

class DataWatcher {
    companion object {
        private fun addWatcherToObject(prefix: String, o: Any, dataWatcher: DataWatcher) {
            for (p in Object.keys(o)) {
                val child = o.asDynamic()[p]

                Object.defineProperty(o, p, ObjectPropertyAccessDescriptor(configurable = true,
                        set = {
                            dataWatcher.changedProperties.add("$prefix$p")
                            o.asDynamic()[p] = it
                        }))

                if (jsTypeOf(child) == "object") {
                    addWatcherToObject("$prefix$p.", child, dataWatcher)
                }
            }
        }

        fun watch(o: Any): DataWatcher {
            val watcher = DataWatcher()

            addWatcherToObject("", o, watcher)

            return watcher
        }
    }

    private val changedProperties = mutableListOf<String>()

    val changed: List<String>
        get() = changedProperties

    fun reset() {
        changedProperties.clear()
    }
}