package structures.api

@kotlinx.serialization.Serializable
data class PullRequests(
    val action: String,
    val label: Label,
    val number: Int,
    val organization: Organization,
    val pull_request: PullRequest,
    val repository: Repository,
    val sender: Sender
) : Response()