package de.ttt.management.table

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class TableModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Test
    fun `should get all tables`() {
        restTestClient.get()
            .uri("/api/table/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get free tables`() {
        restTestClient.get()
            .uri("/api/table/free")
            .exchange()
            .expectStatus().isOk
            .expectBody()
    }

    @Test
    fun `should get table by id`() {
        restTestClient.get()
            .uri("/api/table/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
    }

    @Test
    fun `should return 404 for non-existent table`() {
        restTestClient.get()
            .uri("/api/table/9999")
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `should lock and unlock table`() {
        // Lock
        restTestClient.get()
            .uri("/api/table/1/lock")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        // Unlock
        restTestClient.get()
            .uri("/api/table/1/unlock")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to lock non-existent table`() {
        restTestClient.get()
            .uri("/api/table/9999/lock")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should fail to unlock non-existent table`() {
        restTestClient.get()
            .uri("/api/table/9999/unlock")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should get by table manager`() {
        restTestClient.get()
            .uri("/api/tables?table_manager=1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
    }
}
