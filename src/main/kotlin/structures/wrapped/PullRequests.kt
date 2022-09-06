package structures.wrapped


class PullRequests(
    private val prs: structures.api.PullRequests
) {
    val action = prs.action
    val head = prs.pull_request.head
    val base = prs.pull_request.base
    val currentRepository = Repository(prs.repository)
}