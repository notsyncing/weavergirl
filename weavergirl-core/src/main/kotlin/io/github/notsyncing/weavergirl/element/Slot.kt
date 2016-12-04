package io.github.notsyncing.weavergirl.element

@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
annotation class Slot(val value: String)