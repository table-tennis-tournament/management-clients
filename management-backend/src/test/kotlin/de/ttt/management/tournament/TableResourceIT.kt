package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import kotlin.test.assertEquals

/** `/api/v2/table`: tables, their matches and locks. */
class TableResourceIT : ResourceIT() {

    private val success = """{"success": true}"""
    private val tableNotFound = """{"success": false, "message": "Table not found"}"""

    private fun lockedTableIds(): List<Long> =
        db.jdbc.queryForList("SELECT tabl_id FROM mgmt_table_lock ORDER BY tabl_id", Long::class.java).filterNotNull()

    @Nested
    inner class `tables with matches in every state` {

        @BeforeEach
        fun setup() = givenMatchesInEveryState()

        @Test
        fun `all tables with their matches`() {
            get("/table/all").expectStatus().isOk.expectJson("table/in-every-state/all")
        }

        @Test
        fun `only the table without a match is free`() {
            get("/table/free").expectStatus().isOk.expectJson("table/in-every-state/free")
        }

        @Test
        fun `a table with a doubles match in the second call`() {
            get("/table/2").expectStatus().isOk.expectJson("table/in-every-state/2")
        }
    }

    @Nested
    inner class `twelve tables` {

        @BeforeEach
        fun setup() = givenTwelveTables()

        @Test
        fun `all tables`() {
            get("/table/all").expectStatus().isOk.expectJson("table/all")
        }

        @Test
        fun `the free tables`() {
            get("/table/free").expectStatus().isOk.expectJson("table/free")
        }

        @Test
        fun `a table by id`() {
            get("/table/1").expectStatus().isOk.expectJson("table/1")
        }

        @Test
        fun `an unknown table is not found`() {
            get("/table/9999").expectStatus().isNotFound.expectBody().isEmpty()
        }

        @Test
        fun `locks and unlocks a table`() {
            post("/table/1/lock").expectStatus().isOk.expectExactJson(success)
            get("/table/1").expectStatus().isOk.expectJson("table/1-locked")

            post("/table/1/unlock").expectStatus().isOk.expectExactJson(success)
            get("/table/1").expectStatus().isOk.expectJson("table/1")
        }

        @Test
        fun `locking a locked table and unlocking an unlocked one change nothing`() {
            post("/table/1/lock").expectStatus().isOk
            post("/table/1/lock").expectStatus().isOk.expectExactJson(success)
            assertEquals(listOf(1L), lockedTableIds())

            post("/table/1/unlock").expectStatus().isOk
            post("/table/1/unlock").expectStatus().isOk.expectExactJson(success)
            assertEquals(emptyList(), lockedTableIds())
        }

        @Test
        fun `lock and unlock address a table by its number, not its id`() {
            // ids 20 and 21 carry the swapped numbers 21 and 20
            db.insertTable(20, "21")
            db.insertTable(21, "20")

            post("/table/20/lock").expectStatus().isOk.expectExactJson(success)
            assertEquals(listOf(21L), lockedTableIds())

            post("/table/20/unlock").expectStatus().isOk.expectExactJson(success)
            assertEquals(emptyList(), lockedTableIds())
        }

        @Test
        fun `a locked table is not free`() {
            post("/table/1/lock").expectStatus().isOk
            get("/table/free").expectStatus().isOk.expectJson("table/free-table-1-locked")
        }

        @Test
        fun `rejects locking an unknown table`() {
            post("/table/9999/lock").expectStatus().isBadRequest.expectExactJson(tableNotFound)
        }

        @Test
        fun `rejects unlocking an unknown table`() {
            post("/table/9999/unlock").expectStatus().isBadRequest.expectExactJson(tableNotFound)
        }
    }
}
