package io.github.notsyncing.weavergirl.view

import io.github.notsyncing.weavergirl.route.Parameters

class PageContext(val parameters: Parameters) {
    constructor() : this(Parameters())
}