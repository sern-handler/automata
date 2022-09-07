package structures.wrapped

import Client
import kotlinx.coroutines.Deferred
import structures.api.PullRequest
import structures.options.PullRequestCreateOptions
import structures.api.PullRequests



class PullRequestsManager(
    client: Client,
    private val prs: PullRequests
) : Base(client) {
    val action = prs.action
    val head = prs.pull_request.head
    val base = prs.pull_request.base
    val currentRepository = Repository(client, prs.repository)

    fun create(
        repoName: String,
        options: PullRequestCreateOptions
    ): Deferred<PullRequest> {
        return client.api.postAsync("repos/${client.api.orgName}/${repoName}/pulls", options)
    }
}