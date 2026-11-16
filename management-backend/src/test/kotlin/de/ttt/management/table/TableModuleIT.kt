package de.ttt.management.table

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class TableModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var db: DatabaseHelper

    /**
     * Tables 1 to 12 (table manager 1 has 1-5, manager 2 has 6, 7, 8, 11, 12); table 2 holds
     * match 1, so the free tables are 1 and 3 to 12.
     */
    @BeforeEach
    fun setup() {
        db.clean()
        db.insertTables(1L..12L)
        db.insertDiscipline(1, "Herren")
        db.insertPlayer(1, "Jane", "Doe")
        db.insertPlayer(2, "John", "Roe")
        db.insertMatch(1, 1, 2, disciplineId = 1, tableId = 2)
    }

    @Test
    fun `should get all tables`() {
        restTestClient.get()
            .uri("/api/v2/table/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[*].number").isEqualTo((1..12).toList())
            .jsonPath("$[1].matches[*].id").isEqualTo(listOf(1))
    }

    @Test
    fun `should get free tables`() {
        restTestClient.get()
            .uri("/api/v2/table/free")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$[*].number").isEqualTo(listOf(1) + (3..12).toList())
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
