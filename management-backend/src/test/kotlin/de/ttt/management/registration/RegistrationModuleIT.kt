package de.ttt.management.registration

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class RegistrationModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Test
    fun `should get all players`() {
        restTestClient.get()
            .uri("/api/players")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get player by id`() {
        restTestClient.get()
            .uri("/api/players/54")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(54)
    }

    @Test
    fun `should return 404 for non-existent player`() {
        restTestClient.get()
            .uri("/api/players/9999")
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `should get players by type`() {
        restTestClient.get()
            .uri("/api/players/type/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should return empty list for non-existent type`() {
        restTestClient.get()
            .uri("/api/players/type/9999")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }

    @Test
    fun `should fail to set player active state for non-existent player`() {
        restTestClient.post()
            .uri("/api/players/9999/active/true")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should fail setPayed with invalid id format`() {
        restTestClient.post()
            .uri("/api/players/abc/paid?paid=true")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should get all type colors`() {
        restTestClient.get()
            .uri("/api/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectBody()
    }

    @Test
    fun `should save type color successfully`() {
        val colorData = mapOf("bgColor" to "red", "textColor" to "white")
        restTestClient.post()
            .uri("/api/disciplines/1/color")
            .contentType(MediaType.APPLICATION_JSON)
            .body(colorData)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to save color for non-existent type`() {
        val colorData = mapOf("bgColor" to "red", "textColor" to "white")
        restTestClient.post()
            .uri("/api/disciplines/9999/color")
            .contentType(MediaType.APPLICATION_JSON)
            .body(colorData)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(false)
    }

    @Test
    fun `should save bulk colors successfully`() {
        val colors = mapOf("1" to mapOf("bgColor" to "blue", "textColor" to "black"))
        restTestClient.put()
            .uri("/api/disciplines/colors")
            .contentType(MediaType.APPLICATION_JSON)
            .body(colors)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }
}
