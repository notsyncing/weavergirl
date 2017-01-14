package io.github.notsyncing.weavergirl.html.interop.webjar

fun webjar(relUrl: String): String {
    return "/META-INF/resources/webjar/$relUrl"
}