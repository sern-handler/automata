import org.jetbrains.kotlin.gradle.tasks.KotlinCompile
val jwt_version : String by project
val coroutine_version : String by project
val gh_version : String by project
val arrow_fx_version : String by project
val fuel_version : String by project
plugins {
    kotlin("jvm") version "1.7.10"
    application
    kotlin("plugin.serialization") version "1.7.10"
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation(platform("io.arrow-kt:arrow-stack:$arrow_fx_version"))
    testImplementation(kotlin("test"))
    implementation("io.ktor:ktor-client-core:2.1.0")
    implementation("io.ktor:ktor-client-cio:2.1.0")
    implementation("io.ktor:ktor-client-content-negotiation:2.1.0")
    // Use JSON serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.3.2")
    implementation("io.ktor:ktor-server-core-jvm:2.0.3")
    implementation("io.ktor:ktor-server-netty-jvm:2.0.3")
    implementation("com.auth0:java-jwt:$jwt_version")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$coroutine_version")
    implementation("io.github.cdimascio:dotenv-kotlin:6.3.1")
    implementation("org.kohsuke:github-api:$gh_version")
    implementation("io.arrow-kt:arrow-fx-coroutines")
    implementation("io.arrow-kt:arrow-core")
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "1.8"
}

application {
    mainClass.set("MainKt")
}