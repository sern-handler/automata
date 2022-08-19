package structures.api.application
@kotlinx.serialization.Serializable
data class Permissions(
    val actions : String,
    val checks : String,
    val issues: String,
    val metadata: String,
    val organization_events : String,
    val organization_plan : String,
    val pull_requests : String,
    val repository_projects : String,
)