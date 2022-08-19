package structures.api.application

@kotlinx.serialization.Serializable
data class Application(
    val created_at: String,
    val description: String,
    val events: List<String>,
    val installations_count : Int,
    val external_url: String,
    val html_url: String,
    val id: Int,
    val name: String,
    val node_id: String,
    val owner: Owner,
    val permissions: Permissions,
    val slug: String,
    val updated_at: String
)