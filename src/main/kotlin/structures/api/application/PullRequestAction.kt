package structures.api.application

import kotlinx.serialization.SerialName

@kotlinx.serialization.Serializable
enum class PullRequestAction {
    @SerialName("assigned")
    Assigned,
    @SerialName("auto_merge_disabled")
    AutoMergeDisabled,
    /*
     if the action is closed and the merged key is false,
     the pull request was closed with unmerged commits. If the action is closed and the merged key is true, the pull request was merged.
     */
    @SerialName("closed")
    Closed,
    @SerialName("converted_to_draft")
    ConvertedToDraft,
    @SerialName("edited")
    Edited,
    @SerialName("labeled")
    Labeled,
    @SerialName("locked")
    Locked,
    @SerialName("opened")
    Opened,
    @SerialName("ready_for_review")
    ReadyForReview,
    @SerialName("reopened")
    Reopened,
    @SerialName("review_request_removed")
    ReviewRequestRemoved,
    @SerialName("review_requested")
    ReviewRequested,

    /**
     * Triggered when a pull request's head branch is updated.
     * For example, when the head branch is updated from the base branch,
     * when new commits are pushed to the head branch, or when the base branch is changed.
     */
    @SerialName("synchronize")
    Sync,
    @SerialName("unassigned")
    Unassigned,
    @SerialName("unlabeled")
    Unlabeled,
    @SerialName("unlocked")
    Unlocked;

    override fun toString(): String {
        return name
    }
}
