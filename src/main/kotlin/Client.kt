import io.github.cdimascio.dotenv.dotenv

import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import jdk.nashorn.internal.parser.Token
import kotlinx.coroutines.*
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import structures.HttpProvider
import structures.api.Response
import structures.api.account.OrgAccount
import structures.api.account.TokenData
import java.util.*
import kotlin.coroutines.CoroutineContext


object Client : CoroutineScope {

    private var parentJob = Job()
    val eventEmitter = EventEmitter()
    val json = Json { ignoreUnknownKeys = true }
    lateinit var application : structures.api.application.Application
    lateinit var orgAccount: OrgAccount
    lateinit var tokenData : TokenData
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + parentJob
    private val server = embeddedServer(
        Netty,
        port = 8000,
        host = "localhost",
        parentCoroutineContext = coroutineContext
    ) {
        configureRouting()
        install(ContentNegotiation)
    }
    init {
        dotenv {
            systemProperties = true
        }
    }

    inline fun <reified T : Response> on(
        eventName: String,
        crossinline fn: (T) -> Unit
    ) {
        launch {
            eventEmitter.events.collect {
                when (eventName) {
                    "pull_request" -> {
                        fn(json.decodeFromString(it))
                    }
                }
            }
        }
    }
    suspend fun loginAsync() {
        verifyWithJwt()
        verifyWithInstallationApp()
        getInstallationToken()

    }
    private suspend fun verifyWithJwt() {
        application = HttpProvider.loginIntoApplicationAsync().await()
    }
    private suspend fun verifyWithInstallationApp() {
        orgAccount = HttpProvider.loginIntoOrgAsync().await()

    }
    private suspend fun getInstallationToken() {
        tokenData = HttpProvider.getInstallationToken(orgAccount).await()
    }
    /**
     * This should start last in order to prevent blocking of thread and listeners
     */
    fun startWebhookListener() {
        server.start(wait = true)
    }
}