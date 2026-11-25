package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.DatabaseHelper
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.Scenarios
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import kotlin.test.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/table`: tables, their matches and locks. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class TableResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    @Autowired
    private lateinit var db: DatabaseHelper

    @BeforeEach
    fun resetState() = testState.reset()

    private val success = """{"success": true}"""
    private val tableNotFound = """{"success": false, "message": "Table not found"}"""

    private fun lockedTableIds(): List<Long> =
        db.jdbc.queryForList("SELECT tabl_id FROM mgmt_table_lock ORDER BY tabl_id", Long::class.java).filterNotNull()

    @Nested
    inner class `tables with matches in every state` {

        @BeforeEach
        fun setup() = scenarios.givenMatchesInEveryState()

        @Test
        fun `all tables with their matches`() {
            api.get("/table/all").expectStatus().isOk.expectJson("table/in-every-state/all")
        }

        @Test
        fun `only the table without a match is free`() {
            api.get("/table/free").expectStatus().isOk.expectJson("table/in-every-state/free")
        }

        @Test
        fun `a table with a doubles match in the second call`() {
            api.get("/table/2").expectStatus().isOk.expectJson("table/in-every-state/2")
        }
    }

    @Nested
    inner class `twelve tables` {

        @BeforeEach
        fun setup() = scenarios.givenTwelveTables()

        @Test
        fun `all tables`() {
            api.get("/table/all").expectStatus().isOk.expectJson("table/all")
        }

        @Test
        fun `the free tables`() {
            api.get("/table/free").expectStatus().isOk.expectJson("table/free")
        }

        @Test
        fun `a table by id`() {
            api.get("/table/1").expectStatus().isOk.expectJson("table/1")
        }

        @Test
        fun `an unknown table is not found`() {
            api.get("/table/9999").expectStatus().isNotFound.expectBody().isEmpty()
        }

        @Test
        fun `locks and unlocks a table`() {
            api.post("/table/1/lock").expectStatus().isOk.expectExactJson(success)
            api.get("/table/1").expectStatus().isOk.expectJson("table/1-locked")

            api.post("/table/1/unlock").expectStatus().isOk.expectExactJson(success)
            api.get("/table/1").expectStatus().isOk.expectJson("table/1")
        }

        @Test
        fun `locking a locked table and unlocking an unlocked one change nothing`() {
            api.post("/table/1/lock").expectStatus().isOk
            api.post("/table/1/lock").expectStatus().isOk.expectExactJson(success)
            assertEquals(listOf(1L), lockedTableIds())

            api.post("/table/1/unlock").expectStatus().isOk
            api.post("/table/1/unlock").expectStatus().isOk.expectExactJson(success)
            assertEquals(emptyList(), lockedTableIds())
        }

        @Test
        fun `lock and unlock address a table by its number, not its id`() {
            // ids 20 and 21 carry the swapped numbers 21 and 20
            db.insertTable(20, "21")
            db.insertTable(21, "20")

            api.post("/table/20/lock").expectStatus().isOk.expectExactJson(success)
            assertEquals(listOf(21L), lockedTableIds())

            api.post("/table/20/unlock").expectStatus().isOk.expectExactJson(success)
            assertEquals(emptyList(), lockedTableIds())
        }

        @Test
        fun `a locked table is not free`() {
            api.post("/table/1/lock").expectStatus().isOk
            api.get("/table/free").expectStatus().isOk.expectJson("table/free-table-1-locked")
        }

        @Test
        fun `rejects locking an unknown table`() {
            api.post("/table/9999/lock").expectStatus().isBadRequest.expectExactJson(tableNotFound)
        }

        @Test
        fun `rejects unlocking an unknown table`() {
            api.post("/table/9999/unlock").expectStatus().isBadRequest.expectExactJson(tableNotFound)
        }
    }
}
