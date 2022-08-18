package structures
@kotlinx.serialization.Serializable
data class Milestone(
    val creator: User,
    val description: String,
    val html_url: String,
    val id: Int,
    val labels_url: String,
    val node_id: String,
    val number: Int,
    val title: String,
    val url: String
)