package io.github.notsyncing.weavergirl.tests

import io.github.notsyncing.weavergirl.model.DataWatcher
import io.github.notsyncing.weavergirl.tests.toys.TestModel
import org.junit.Test
import kotlin.test.assertEquals

class DataWatcherTest {
    @Test
    fun testWatchSimpleObject() {
        val obj = TestModel()
        val watcher = DataWatcher.watch(obj)

        obj.a = 1

        assertEquals(1, watcher.changed.size)
        assertEquals("a", watcher.changed[0])
    }
}