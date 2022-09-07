
import kotlinx.coroutines.*
import structures.api.application.PullRequestAction
import structures.options.PullRequestCreateOptions
import structures.wrapped.PullRequestsManager

fun main() = runBlocking {
    val sernClient = Client()
    sernClient.loginAsync()

    sernClient.on<PullRequestsManager>("pull_request") { pr_event ->
        when(pr_event.action) {
            PullRequestAction.Opened -> {
                println("new pull request opened")
            }
            else -> Unit
        }
    }
    sernClient.startWebhookListener()
}



