package de.ttt.management.tournament

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test

/** `/api/v2/tables`: the tables of one table manager, for the Table Manager View. */
class TablesResourceIT : ResourceIT() {

    @Nested
    inner class `tables with matches in every state` {

        @BeforeEach
        fun setup() = givenMatchesInEveryState()

        @Test
        fun `the tables of table manager 1 with their matches, players and clubs`() {
            get("/tables?table_manager=1").expectStatus().isOk.expectJson("tables/in-every-state/manager-1")
        }
    }

    @Nested
    inner class `twelve tables` {

        @BeforeEach
        fun setup() = givenTwelveTables()

        @Test
        fun `the tables of table manager 1`() {
            get("/tables?table_manager=1").expectStatus().isOk.expectJson("tables/manager-1")
        }

        @Test
        fun `table manager 1 is the default`() {
            get("/tables").expectStatus().isOk.expectJson("tables/manager-1")
        }

        @Test
        fun `only the tables of table manager 2`() {
            get("/tables?table_manager=2").expectStatus().isOk.expectJson("tables/manager-2")
        }

        @Test
        fun `an unknown table manager has no tables`() {
            get("/tables?table_manager=99").expectStatus().isOk.expectExactJson("[]")
        }
    }
}
