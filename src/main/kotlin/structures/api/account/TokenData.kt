package structures.api.account

import structures.api.application.Permissions

@kotlinx.serialization.Serializable
data class TokenData(
    val expires_at: String,
    val permissions: Permissions,
    val repository_selection: String,
    val token: String
)