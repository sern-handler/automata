import arrow.core.Either
import arrow.fx.coroutines.release
import arrow.fx.coroutines.resource
import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.exceptions.JWTCreationException
import io.github.cdimascio.dotenv.dotenv
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.channels.Channel.Factory.UNLIMITED
import kotlinx.coroutines.flow.collect
import org.kohsuke.github.*
import org.kohsuke.github.connector.GitHubConnector
import java.security.KeyFactory
import java.security.interfaces.RSAPrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.time.Instant
import java.util.*
import kotlin.coroutines.CoroutineContext

object Client : CoroutineScope {
    private const val orgName = "sern-handler"
    private const val baseLink = "https://api.github.com"
    private var jwtToken: String
    private var gitHubApp: GHApp
    private var gitHub: GitHub
    private var parentJob = Job()
    val eventEmitter = EventEmitter()

    override val coroutineContext: CoroutineContext
        get() = Dispatchers.Default + parentJob
    private val server = embeddedServer(
        Netty,
        port = 8000,
        host = "localhost",
        parentCoroutineContext = coroutineContext
    ) {
        configureRouting()
    }
    init {
        runBlocking {
            dotenv {
                systemProperties = true
            }
            val privateKey = processKey().use { it }
            val algorithm = Algorithm.RSA256(privateKey)
            jwtToken = JWT.create()
                .withIssuer("215907")
                .withIssuedAt(Instant.now().minusMillis(6_000))
                .withExpiresAt(Instant.now().plusMillis(600000))
                .sign(algorithm) ?: throw JWTCreationException("Could not create JWT", Throwable())
            val github = GitHubBuilder()
                .withJwtToken(jwtToken)
                .withConnector(GitHubConnector.DEFAULT)
                .withEndpoint(baseLink)
                .build()
            gitHubApp = github.app
            val appInstallation = gitHubApp.getInstallationByOrganization("sern-handler")
            val installationToken = appInstallation.createToken().create()
            gitHub = GitHubBuilder()
                .withAppInstallationToken(installationToken.token)
                .withEndpoint(baseLink)
                .build()

        }
    }

    fun fetchRepoAsync(name: String) : Deferred<Either<String,GHRepository>> {
        return async {
            try {
                Either.Right(gitHub.getRepository("$orgName/$name"))
            } catch (e: Throwable) {
                Either.Left(e.message ?: "Something went wrong while trying to fetch repository")
            }

        }
    }
     fun fetchPullRequestAsync(repo : GHRepository, id: Int) : Deferred<Either<String, GHPullRequest>> {
        return async {
                try {
                    Either.Right(repo.getPullRequest(id))
                } catch(e : Throwable) {
                    Either.Left("Could not find a pull request #$id")
             }
        }
    }
    suspend fun <T> on(
        eventName: String,
        fn: suspend (String) -> Unit
    ) {
        Client.launch {
            eventEmitter.events.collect {
                when (it) {
                    "Hello" -> fn(it)
                }
            }
        }
    }

    private fun processKey() = resource {
        object{}.javaClass.getResourceAsStream("/private_key.pem")
            ?.bufferedReader()
            ?.useLines { br ->
                val privateKey = br.filter { str ->
                    str != "-----BEGIN PRIVATE KEY-----" && str != "-----END PRIVATE KEY-----"
                }
                val seq = privateKey.joinToString("")
                val encoded = Base64.getDecoder().decode(seq)
                val kf = KeyFactory.getInstance("RSA")
                val keySpec = PKCS8EncodedKeySpec(encoded)
                (kf.generatePrivate(keySpec) as RSAPrivateKey)
            }
    } release {
        println("Released resources from reading pem")
    }

    /**
     * This should start last in order to prevent blocking of thread and listeners
     */
    fun startWebhookListener() {
        server.start(wait = true)
    }
}