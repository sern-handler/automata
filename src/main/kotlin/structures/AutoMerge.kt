package structures

@kotlinx.serialization.Serializable
data class AutoMerge(
    val commit_message: String,
    val commit_title: String,
    val enabled_by: EnabledBy,
    val merge_method: String
) : Response()