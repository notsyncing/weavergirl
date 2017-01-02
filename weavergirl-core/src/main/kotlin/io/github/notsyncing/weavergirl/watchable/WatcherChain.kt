package io.github.notsyncing.weavergirl.watchable

class WatcherChain<T> {
    private var value: T? = null
    private var ex: Throwable? = null
    private var catchHandler: ((Throwable) -> Unit)? = null
    private var thenHandler: ((T?) -> Any?)? = null
    private var status = WatcherStatus.Ready
    private var next: WatcherChain<Any>? = null
    
    fun resolve(value: T?): WatcherChain<T> {
        this.value = value
        status = WatcherStatus.Resolved

        println("WatcherChain resolved with $value, thenHandler $thenHandler")

        val v = thenHandler?.invoke(value)

        if (v is WatcherChain<*>) {
            v.then { next?.resolve(it) }.catch { next?.reject(it) }
        } else {
            next?.resolve(v)
        }
        
        return this
    }
    
    fun reject(ex: Throwable): WatcherChain<T> {
        this.ex = ex
        status = WatcherStatus.Rejected
        catchHandler?.invoke(ex)
        
        return this
    }
    
    fun <R> thenApply(functor: (T?) -> R?): WatcherChain<R> {
        this.thenHandler = functor

        if (status == WatcherStatus.Resolved) {
            return WatcherChain<R>().resolve(functor(value))
        } else {
            val c = WatcherChain<R>()
            next = c as WatcherChain<Any>
            return c
        }
    }
    
    fun <R> then(functor: (T?) -> WatcherChain<R>): WatcherChain<R> {
        this.thenHandler = functor

        if (status == WatcherStatus.Resolved) {
            return functor(value)
        } else {
            val c = WatcherChain<R>()
            next = c as WatcherChain<Any>
            return c
        }
    }
    
    fun then(functor: (T?) -> Unit): WatcherChain<Unit> {
        this.thenHandler = functor

        if (status == WatcherStatus.Resolved) {
            functor(value)
            return WatcherChain<Unit>().resolve(Unit)
        } else {
            val c = WatcherChain<Unit>()
            next = c as WatcherChain<Any>
            return c
        }
    }
    
    fun catch(handler: (Throwable) -> Unit) {
        this.catchHandler = handler
        
        if (status == WatcherStatus.Rejected) {
            handler(ex!!)
        }
    }
}