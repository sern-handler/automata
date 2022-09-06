package structures.api

import structures.api.application.PullRequestAction

@kotlinx.serialization.Serializable
data class PullRequests(
    val action: PullRequestAction,
    val label: Label,
    val number: Int,
    val organization: Organization,
    val pull_request: PullRequest,
    val repository: Repository,
    val sender: Sender
) : Response()