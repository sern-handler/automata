
import kotlinx.coroutines.*
import structures.PullRequests

fun main() = runBlocking {

    val client = Client
    val repo = client.fetchRepoAsync("awesome-plugins").await()

    client.on<PullRequests>("pull_request") {

        println(it)
    }
    println("Start program")
    client.startWebhookListener()
}




