
import kotlinx.coroutines.*

fun main() = runBlocking {

    val client = Client

    client.on<String>("pullRequest") {
        println(it + "2")
    }
    client.on<String>("issue") {
        println(it + "3")
    }
    println("Start program")
    println(Thread.currentThread().name)
    client.startWebhookListener()
}




