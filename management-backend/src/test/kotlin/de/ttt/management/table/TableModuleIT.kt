package de.ttt.management.table

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

/**
 * Responses are compared completely, inline or with `expected/table/<name>.json`
 * (see [de.ttt.management.ExpectedJson]).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class TableModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var db: DatabaseHelper

    private val tableNotFound = """{"success": false, "message": "Table not found"}"""

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

    private fun get(uri: String) = restTestClient.get().uri("/api/v2$uri").exchange()

    private fun post(uri: String) = restTestClient.post().uri("/api/v2$uri").exchange()

    @Test
    fun `should get all tables`() {
        get("/table/all").expectStatus().isOk.expectJson("table/all")
    }

    @Test
    fun `should get free tables`() {
        get("/table/free").expectStatus().isOk.expectJson("table/free")
    }

    @Test
    fun `should get table by id`() {
        get("/table/1").expectStatus().isOk.expectJson("table/1")
    }

    @Test
    fun `should return 404 for non-existent table`() {
        get("/table/9999").expectStatus().isNotFound
    }

    @Test
    fun `should lock and unlock table`() {
        post("/table/1/lock").expectStatus().isOk.expectExactJson("""{"success": true}""")
        get("/table/1").expectStatus().isOk.expectJson("table/1-locked")

        post("/table/1/unlock").expectStatus().isOk.expectExactJson("""{"success": true}""")
        get("/table/1").expectStatus().isOk.expectJson("table/1")
    }

    @Test
    fun `locked table is excluded from free tables`() {
        post("/table/1/lock").expectStatus().isOk

        get("/table/free").expectStatus().isOk.expectJson("table/free-table-1-locked")
    }

    @Test
    fun `should fail to lock non-existent table`() {
        post("/table/9999/lock").expectStatus().isBadRequest.expectExactJson(tableNotFound)
    }

    @Test
    fun `should fail to unlock non-existent table`() {
        post("/table/9999/unlock").expectStatus().isBadRequest.expectExactJson(tableNotFound)
    }

    @Test
    fun `should get by table manager`() {
        get("/tables?table_manager=1").expectStatus().isOk.expectJson("table/manager-1")
    }

    @Test
    fun `table manager mapping returns only that manager's tables`() {
        get("/tables?table_manager=2").expectStatus().isOk.expectJson("table/manager-2")
    }

    @Test
    fun `unknown table manager returns no tables`() {
        get("/tables?table_manager=99").expectStatus().isOk.expectExactJson("[]")
    }
}
