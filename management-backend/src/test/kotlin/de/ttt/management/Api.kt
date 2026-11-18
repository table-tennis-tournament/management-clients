package de.ttt.management

import org.springframework.http.MediaType
import org.springframework.test.web.servlet.client.RestTestClient

/**
 * Calls the backend's REST API under `/api/v2` for the REST integration tests (registered by
 * [ResourceTestConfiguration]). Responses are compared completely, inline with `expectExactJson` or with
 * `expected/<resource>/<name>.json` via `expectJson` (see [ExpectedJson]).
 */
class Api(private val restTestClient: RestTestClient) {

    fun get(path: String) = restTestClient.get().uri("/api/v2$path").exchange()

    fun delete(path: String) = restTestClient.delete().uri("/api/v2$path").exchange()

    fun post(path: String, body: Any? = null): RestTestClient.ResponseSpec {
        val request = restTestClient.post().uri("/api/v2$path")
        if (body != null) request.contentType(MediaType.APPLICATION_JSON).body(body)
        return request.exchange()
    }

    fun put(path: String, body: Any) =
        restTestClient.put().uri("/api/v2$path").contentType(MediaType.APPLICATION_JSON).body(body).exchange()

    /** Compares the whole `GET /match/{id}` body with `expected/match/<name>.json`. */
    fun expectMatch(id: Long, name: String) {
        get("/match/$id").expectStatus().isOk.expectJson("match/$name")
    }
}
