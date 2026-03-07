package de.ttt.management

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import org.testcontainers.containers.MariaDBContainer
import org.testcontainers.junit.jupiter.Container
import org.testcontainers.junit.jupiter.Testcontainers

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@Testcontainers
@ActiveProfiles("test")
class ManagementBackendIT {

    companion object {
        @Container
        @ServiceConnection
        val mariaDB = MariaDBContainer("mariadb:11.2")
    }

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
    fun `should get all tables`() {
        restTestClient.get()
            .uri("/api/tables")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get free tables`() {
        restTestClient.get()
            .uri("/api/tables/free")
            .exchange()
            .expectStatus().isOk
            .expectBody()
    }

    @Test
    fun `should get all disciplines`() {
        restTestClient.get()
            .uri("/api/disciplines")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get all matches`() {
        restTestClient.get()
            .uri("/api/matches")
            .exchange()
            .expectStatus().isOk
            .expectBody()
    }

    @Test
    fun `should get a specific table`() {
        restTestClient.get()
            .uri("/api/tables/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
    }
}
