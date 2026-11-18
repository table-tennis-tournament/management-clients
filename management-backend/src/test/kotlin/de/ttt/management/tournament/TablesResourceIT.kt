package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.Scenarios
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/tables`: the tables of one table manager, for the Table Manager View. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class TablesResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    @BeforeEach
    fun resetState() = testState.reset()

    @Nested
    inner class `tables with matches in every state` {

        @BeforeEach
        fun setup() = scenarios.givenMatchesInEveryState()

        @Test
        fun `the tables of table manager 1 with their matches, players and clubs`() {
            api.get("/tables?table_manager=1").expectStatus().isOk.expectJson("tables/in-every-state/manager-1")
        }
    }

    @Nested
    inner class `twelve tables` {

        @BeforeEach
        fun setup() = scenarios.givenTwelveTables()

        @Test
        fun `the tables of table manager 1`() {
            api.get("/tables?table_manager=1").expectStatus().isOk.expectJson("tables/manager-1")
        }

        @Test
        fun `a match at two tables is shown at both`() {
            // match 1 waits at table 2; its group gets table 3 as a second table
            api.post("/match/matchtosecondtable/3", listOf(1)).expectStatus().isOk
            api.get("/tables?table_manager=1").expectStatus().isOk.expectJson("tables/manager-1-second-table")
        }

        @Test
        fun `table manager 1 is the default`() {
            api.get("/tables").expectStatus().isOk.expectJson("tables/manager-1")
        }

        @Test
        fun `only the tables of table manager 2`() {
            api.get("/tables?table_manager=2").expectStatus().isOk.expectJson("tables/manager-2")
        }

        @Test
        fun `an unknown table manager has no tables`() {
            api.get("/tables?table_manager=99").expectStatus().isOk.expectExactJson("[]")
        }
    }
}
