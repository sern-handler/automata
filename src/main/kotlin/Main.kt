
import kotlinx.coroutines.*
import structures.PullRequests

fun main() = runBlocking {

    val client = Client
    val repo = client.fetchRepoAsync("awesome-plugins").await()

    client.on<PullRequests>("pull_request") {
        repo.getPullRequest(it.number).comment("Hello, I just saw that you did something to this pull request")
    }
    println("Start program")
    client.startWebhookListener()
}




