package io.github.notsyncing.weavergirl.html.route

class Parameters {
    private val map = mutableMapOf<String, MutableList<String>>()

    fun get(key: String): List<String> {
        return map[key] ?: emptyList()
    }

    fun set(key: String, values: MutableList<String>) {
        map[key] = values
    }

    fun put(key: String, value: String) {
        if (!map.containsKey(key)) {
            map[key] = mutableListOf()
        }

        map[key]!!.add(value)
    }

    override fun toString(): String {
        val b = StringBuilder().append("{")

        map.forEach { (k, vs) ->
            b.append("\"$k\":[")
                    .append(vs.joinToString(separator = ", ", prefix = "\"", postfix = "\""))
                    .append("], ")
        }

        return b.removeSuffix(", ").toString() + "}"
    }
}