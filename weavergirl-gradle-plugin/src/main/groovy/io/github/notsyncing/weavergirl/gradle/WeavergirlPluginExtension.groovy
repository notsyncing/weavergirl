package io.github.notsyncing.weavergirl.gradle

class WeavergirlPluginExtension {
    String srcDir = "src"
    String[] additionalFiles = []

    boolean useBabel = false
    String babelLevel = "full"
    String[] babelSkipFiles = []
}
