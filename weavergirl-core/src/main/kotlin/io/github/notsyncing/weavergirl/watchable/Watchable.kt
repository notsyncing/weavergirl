package io.github.notsyncing.weavergirl.watchable

class Watchable<T>() {
    private var oldValue: T? = null
    private var value: T? = null
    private var fireWatcher: WatcherChain<Unit>? = null
    private var fired = false
    private var setWatcher: WatcherChain<WatcherSet<T>>? = null
    private var set = false
    private var changeWatcher: WatcherChain<WatcherChange<T>>? = null
    private var changed = false
    private var failWatcher: WatcherChain<WatcherFailed>? = null
    private var failed = false
    private var ex: Throwable? = null

    constructor(value: T) : this() {
        set = true
        this.value = value
    }

    fun get(): T? {
        return value
    }

    fun set(value: T?): T? {
        println("Value set: $value")
        oldValue = this.value
        set = true

        if (oldValue != value) {
            changed = true
            println("Value changed from $oldValue to $value")
        }

        this.value = value

        if (set) {
            setWatcher?.resolve(WatcherSet(value))
        }

        if (changed) {
            changeWatcher?.resolve(WatcherChange(oldValue, value))
        }

        return oldValue
    }

    fun fail(ex: Throwable) {
        this.ex = ex
        failed = true

        if (failed) {
            failWatcher?.reject(ex)
        }
    }

    fun fire() {
        fired = true
        fireWatcher?.resolve(Unit)
    }

    fun onSet(handler: (WatcherSet<T>) -> Unit): WatcherChain<WatcherSet<T>> {
        setWatcher = WatcherChain<WatcherSet<T>>()
        setWatcher!!.thenApply {
                    val s = WatcherSet(value)
                    handler(s)
                    s
                }

        if (set) {
            set = false
            setWatcher!!.resolve(WatcherSet(value))
        }

        return setWatcher!!
    }

    fun onChanged(handler: (WatcherChange<T>) -> Unit): WatcherChain<WatcherChange<T>> {
        changeWatcher = WatcherChain<WatcherChange<T>>()
        changeWatcher!!.thenApply {
                    println("Change watched: $value")
                    val s = WatcherChange(oldValue, value)
                    handler(s)
                    s
                }

        if (changed) {
            changed = false
            changeWatcher!!.resolve(WatcherChange(oldValue, value))
        }

        return changeWatcher!!
    }

    fun onFired(handler: () -> Unit): WatcherChain<Unit> {
        fireWatcher = WatcherChain<Unit>()
        fireWatcher!!.then { handler() }

        if (fired) {
            fired = false
            fireWatcher!!.resolve(Unit)
        }

        return fireWatcher!!
    }

    fun onFailed(handler: (WatcherFailed) -> Unit): WatcherChain<WatcherFailed> {
        failWatcher = WatcherChain<WatcherFailed>()
        failWatcher!!.thenApply {
                    val s = WatcherFailed(ex!!)
                    handler(s)
                    s
                }

        if (failed) {
            failed = false
            failWatcher!!.resolve(WatcherFailed(ex!!))
        }

        return failWatcher!!
    }
}