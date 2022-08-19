package structures

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import java.security.KeyFactory
import java.security.interfaces.RSAPrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.time.Instant
import java.util.*

/**
 * Thank you hub4j/githubapi
 */
object JWTProvider {
    private val validUntil = Instant.MIN
    private val privateKey: RSAPrivateKey? =
        javaClass.getResourceAsStream("/private_key.pem")
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
    val jwt : String = JWT.create()
                .withIssuer(System.getProperty("APP_ID"))
                .withIssuedAt(Instant.now().minusMillis(6_000))
                .withExpiresAt(Instant.now().plusMillis(600000))
                .sign(Algorithm.RSA256(privateKey))

    fun isNotValid(): Boolean {
        return Instant.now().isAfter(validUntil)
    }
}