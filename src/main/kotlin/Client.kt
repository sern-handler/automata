import io.github.cdimascio.dotenv.dotenv
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import kotlinx.coroutines.*
import kotlinx.serialization.json.Json
import structures.HttpProvider
import structures.api.account.OrgAccount
import structures.api.account.TokenData
import structures.wrapped.Base
import kotlin.coroutines.CoroutineContext

object Globals {
    val eventEmitter = EventEmitter<Base>()
    val serializer = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        explicitNulls = false
    }
}

class Client : CoroutineScope {
    val api = HttpProvider(this)
    private var parentJob = Job()
    lateinit var application : structures.api.application.Application
    lateinit var orgAccount: OrgAccount
    lateinit var tokenData : TokenData
    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + parentJob
    init {
        dotenv {
            systemProperties = true
        }
    }
    inline fun <reified T : Base> on(
        eventName: String,
        crossinline fn: suspend (T) -> Unit
    ) {
        launch {
            Globals.eventEmitter.events.collect {
                when (eventName) {
                    "pull_request" -> {
                        fn(it as T)
                    }
                }
            }
        }
    }
    suspend fun loginAsync() {
        coroutineScope {
            withContext(Dispatchers.Default) {
                application = api.loginIntoApplicationAsync().await()
                orgAccount = api.loginIntoOrgAsync().await()
                tokenData = api.getInstallationTokenAsync(orgAccount).await()
            }
        }
    }
    /**
     * This should start last in order to prevent blocking of thread and listeners
     */
    fun startWebhookListener() {
        embeddedServer(
            Netty,
            port = 8000,
            host = "localhost",
            parentCoroutineContext = coroutineContext
        ) {
            configureRouting(this@Client)
            install(ContentNegotiation) {
                json(Globals.serializer)
            }
        }.start(wait = true).also { println("Started server") }
    }
}