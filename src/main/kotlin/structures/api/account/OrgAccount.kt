package structures.api.account
@kotlinx.serialization.Serializable
data class OrgAccount(
    val access_tokens_url: String,
    val account: Account,
    val app_id: Int,
    val app_slug: String,
    val created_at: String,
    val events: List<String>,
    val has_multiple_single_files: Boolean,
    val html_url: String,
    val id: Int,
    val permissions: structures.api.application.Permissions,
    val repositories_url: String,
    val repository_selection: String,
    val single_file_name: String?,
    val single_file_paths: List<String>,
    val suspended_at: String?,
    val suspended_by: String?,
    val target_id: Int,
    val target_type: String,
    val updated_at: String
)