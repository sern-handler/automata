
import kotlinx.coroutines.*
import structures.api.PullRequests

fun main() = runBlocking {


    Client.loginAsync()
    println(Client.orgAccount)
    Client.on<PullRequests>("pull_request") { pr_event ->
        println(pr_event)
    }
    Client.startWebhookListener()
}




