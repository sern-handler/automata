import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import structures.api.Response
import structures.wrapped.Base

class EventEmitter<T : Base> {
    private val _events = MutableSharedFlow<T>() // private mutable shared flow
    val events = _events.asSharedFlow() // publicly exposed as read-only shared flow

    suspend fun produceEvent(event: T) {
        _events.emit(event) // suspends until all subscribers receive it
    }
}