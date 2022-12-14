package structures.api


@kotlinx.serialization.Serializable
data class PullRequest(
    val _links: Links,
    val active_lock_reason: String?,
    val additions: Int,
    val assignee: User?,
    val assignees: List<User>,
    val author_association: String,
    val auto_merge: AutoMerge?,
    val base: Base,
    val body: String?,
    val changed_files: Int,
    val closed_at: String?,
    val comments: Int,
    val comments_url: String,
    val commits: Int,
    val commits_url: String,
    val created_at: String,
    val deletions: Int,
    val diff_url: String,
    val draft: Boolean,
    val head: Head,
    val html_url: String,
    val id: Int,
    val issue_url: String,
    val labels: List<Label>,
    val locked: Boolean,
    val maintainer_can_modify: Boolean,
    val merge_commit_sha: String?,
    val mergeable: Boolean?,
    val mergeable_state: String,
    val merged: Boolean,
    val merged_at: String?,
    val merged_by: MergedBy?,
    val milestone: Milestone?,
    val node_id: String,
    val number: Int,
    val patch_url: String,
    val rebaseable: Boolean?,
    val requested_reviewers: List<RequestedReviewer>,
    val requested_teams: List<Team>,
    val review_comment_url: String,
    val review_comments: Int,
    val review_comments_url: String,
    val state: String,
    val statuses_url: String,
    val title: String,
    val updated_at: String,
    val url: String,
    val user: User
) : Response()

@kotlinx.serialization.Serializable
data class MergedBy(
    val login : String
)