
import kotlinx.coroutines.*

fun main() = runBlocking {

    val client = Client
    val repo = client.fetchRepoAsync("awesome-plugins").await()

    client.on<String>("pull_request") {

        println(it + "2")
    }
    println("Start program")
    client.startWebhookListener()
}




