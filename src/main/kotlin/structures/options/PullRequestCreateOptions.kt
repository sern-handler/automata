package structures.options

@kotlinx.serialization.Serializable
data class PullRequestCreateOptions(
    val title: String,
    val body: String,
    val head: String,
    val base: String,
    val draft: Boolean? = null,
    val maintainer_can_modify : Boolean? = null
) : PostOptions()