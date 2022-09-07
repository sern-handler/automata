package structures.wrapped

import Client
import structures.api.Repository

class Repository(
    client: Client,
    repository: Repository
) : Base(client) {
    val name = repository.name
    val fullName = repository.full_name

}