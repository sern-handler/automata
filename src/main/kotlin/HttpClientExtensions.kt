import HashUtils.verifySignature
import arrow.core.Either
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import io.ktor.util.pipeline.*
import kotlinx.coroutines.*
import kotlinx.serialization.decodeFromString
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec
import kotlin.experimental.xor


fun Application.configureRouting(client: Client) {
    routing {

        pullRequests(client)
    }

}

fun Routing.pullRequests(client: Client) {
        post("/pulls") {
            val secret = call.request.headers["X-Hub-Signature-256"]!!
            val event = call.request.headers["X-Github-Event"]!!
            val respText = call.receiveText()
            when(val resp = verifySignature(secret, respText)) {
                is Either.Left -> {
                    launch(Dispatchers.Default) {
                        when(event) {
                            "pull_request" -> {
                                Globals.eventEmitter.produceEvent(
                                    structures.wrapped.PullRequestsManager(client,
                                        Globals.serializer.decodeFromString(resp.value)
                                    )
                                )
                            }
                        }
                        call.respond(HttpStatusCode.OK)
                    }.join()
                }
                is Either.Right -> resp.value
            }

        }
}

object HashUtils {
    private fun ByteArray.toHex(): String = joinToString(separator = "") { eachByte -> "%02x".format(eachByte) }

    //https://security.stackexchange.com/questions/239054/timing-attacks-in-password-hash-comparisons
    fun secureCompare(secret : String, hash: String) : Boolean {
        val digesta = secret.toByteArray(); val digestb = hash.toByteArray()

        if (digesta.size and digestb.size == 0) return false
        var difference = 0
        for (i in digesta.indices) difference = difference.or(digesta[i].xor(digestb[i]).toInt())
        return difference == 0
    }
    /**
     * Supported algorithms on Android:
     *
     * Algorithm    Supported API Levels
     * MD5          1+
     * SHA-1        1+
     * SHA-224      1-8,22+
     * SHA-256      1+
     * SHA-384      1+
     * SHA-512      1+
     */
    fun sha256(body: String): String {
        val key = System.getProperty("WEBHOOK_TOKEN")
        val hasher: Mac = Mac.getInstance("HmacSHA256")
        hasher.init(SecretKeySpec(key.toByteArray(), "HmacSHA256"))

        val hash: ByteArray = hasher.doFinal(body.toByteArray())
        return "sha256=${hash.toHex()}"
    }

    suspend inline fun PipelineContext<Unit, ApplicationCall>.verifySignature(secret: String, resp: String) : Either<String, Unit> {
        if(secureCompare(secret, sha256(resp))) {
            return Either.Left(resp)
        }
        return Either.Right(call.respond(HttpStatusCode.Unauthorized, "Nice try"))
    }
}
