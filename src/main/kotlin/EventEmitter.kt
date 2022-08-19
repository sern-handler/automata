import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

class EventEmitter {
    private val _events = MutableSharedFlow<String>() // private mutable shared flow
    val events = _events.asSharedFlow() // publicly exposed as read-only shared flow

    suspend fun produceEvent(event: String) {
        _events.emit(event) // suspends until all subscribers receive it
    }
}