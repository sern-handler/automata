package structures

import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.*
import kotlinx.serialization.json.Json
import structures.api.account.OrgAccount
import structures.api.account.TokenData
import structures.api.application.Application
import kotlin.coroutines.CoroutineContext

object HttpProvider : CoroutineScope {
    private val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json {
                prettyPrint = true
            })
        }
    }
    private const val orgName = "sern-handler"
    private const val baseLink = "https://api.github.com"

     fun loginIntoApplicationAsync() : Deferred<Application> {
        return async {
            httpClient.request("$baseLink/app") {
                headers {
                    append(HttpHeaders.Accept, "application/vnd.github+json")
                    append(HttpHeaders.Authorization, "Bearer ${JWTProvider.jwt}")
                }
            }.body()
        }
    }
    fun loginIntoOrgAsync(): Deferred<OrgAccount> {
         return async {
            // GHAppInstallation
            httpClient.request("$baseLink/orgs/$orgName/installation") {
                headers {
                    append(HttpHeaders.Accept, "application/vnd.github+json")
                    append(HttpHeaders.Authorization, "Bearer ${JWTProvider.jwt}")
                }
            }.body()
        }
    }

    fun getInstallationToken(orgAccount: OrgAccount): Deferred<TokenData> {
         return async {
            httpClient.post("$baseLink/app/installations/${orgAccount.id}/access_tokens") {
                headers {
                    append(HttpHeaders.Accept, "application/vnd.github+json")
                    append(HttpHeaders.Authorization, "Bearer ${JWTProvider.jwt}")
                }
            }.body()
        }
    }
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + Job()
}