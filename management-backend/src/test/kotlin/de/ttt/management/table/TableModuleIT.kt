package de.ttt.management.table

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class TableModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var jdbcTemplate: JdbcTemplate

    @BeforeEach
    fun setup() {
        jdbcTemplate.update("DELETE FROM mgmt_table_lock")
    }

    @Test
    fun `should get all tables`() {
        restTestClient.get()
            .uri("/api/v2/table/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNotEmpty
    }

    @Test
    fun `should get free tables`() {
        restTestClient.get()
            .uri("/api/v2/table/free")
            .exchange()
            .expectStatus().isOk
            .expectBody()
    }

    @Test
    fun `should get table by id`() {
        restTestClient.get()
            .uri("/api/v2/table/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(1)
    }

    @Test
    fun `should return 404 for non-existent table`() {
        restTestClient.get()
            .uri("/api/v2/table/9999")
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `should lock and unlock table`() {
        restTestClient.post()
            .uri("/api/v2/table/1/lock")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        restTestClient.post()
            .uri("/api/v2/table/1/unlock")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `locking a table persists the locked flag`() {
        restTestClient.post()
            .uri("/api/v2/table/1/lock")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/table/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.isLocked").isEqualTo(true)
    }

    @Test
    fun `locked table is excluded from free tables`() {
        restTestClient.post()
            .uri("/api/v2/table/1/lock")
            .exchange()
            .expectStatus().isOk

        restTestClient.get()
            .uri("/api/v2/table/free")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[?(@.id == 1)]").isEmpty()
    }

    @Test
    fun `should fail to lock non-existent table`() {
        restTestClient.post()
            .uri("/api/v2/table/9999/lock")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should fail to unlock non-existent table`() {
        restTestClient.post()
            .uri("/api/v2/table/9999/unlock")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should get by table manager`() {
        restTestClient.get()
            .uri("/api/v2/tables?table_manager=1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(5)
    }

    @Test
    fun `table manager mapping returns only that manager's tables`() {
        restTestClient.get()
            .uri("/api/v2/tables?table_manager=2")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(5)
            .jsonPath("$[?(@.table_number == 6)]").isNotEmpty()
            .jsonPath("$[?(@.table_number == 1)]").isEmpty()
    }

    @Test
    fun `unknown table manager returns no tables`() {
        restTestClient.get()
            .uri("/api/v2/tables?table_manager=99")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isEqualTo(0)
    }
}
