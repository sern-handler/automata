package structures
import Client
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.engine.cio.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.coroutines.*
import kotlinx.serialization.encodeToString
import structures.api.Response
import structures.api.account.OrgAccount
import structures.api.account.TokenData
import structures.api.application.Application
import structures.options.PostOptions
import kotlin.coroutines.CoroutineContext

class HttpProvider(private val client: Client) : CoroutineScope {
    val httpClient = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Globals.serializer)
        }
    }
    enum class ApiType {
        Rest,
        App
    }
    val orgName = "sern-handler"
    val baseLink = "https://api.github.com"

    fun authHeader(type: ApiType): Pair<String, String> {
        return HttpHeaders.Authorization to when(type) {
            ApiType.App -> "Bearer ${JWTProvider.jwt}"
            ApiType.Rest -> "Bearer ${client.tokenData.token}"
        }
    }
    val contentTypeHeader = HttpHeaders.Accept to "application/vnd.github+json"
    inline fun <reified T : Response, reified V: PostOptions> postAsync(path: String, body: V) : Deferred<T> {
         return async {
            httpClient.post("$baseLink/$path") {
                headers {
                    append(HttpHeaders.ContentType, "application/json")
                    append(contentTypeHeader)
                    append(authHeader(ApiType.Rest))
                }
                setBody(body)
            }.body()
        }
    }

     fun loginIntoApplicationAsync() : Deferred<Application> {
        return async {
            httpClient.request("$baseLink/app") {
                headers {
                    append(contentTypeHeader)
                    append(authHeader(ApiType.App))
                }
            }.body()
        }
    }
    fun loginIntoOrgAsync(): Deferred<OrgAccount> {
         return async {
            // GHAppInstallation
            httpClient.request("$baseLink/orgs/$orgName/installation") {
                headers {
                    append(contentTypeHeader)
                    append(authHeader(ApiType.App))
                }
            }.body()
        }
    }

    fun getInstallationTokenAsync(orgAccount: OrgAccount): Deferred<TokenData> {
         return async {
            httpClient.post("$baseLink/app/installations/${orgAccount.id}/access_tokens") {
                headers {
                    append(contentTypeHeader)
                    append(authHeader(ApiType.App))
                }
            }.body()
        }
    }
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + Job()
}

fun HeadersBuilder.append(name: Pair<String, String>) {
    append(name.first, name.second)
}
