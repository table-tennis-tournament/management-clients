package de.ttt.management.tournament

import de.ttt.management.Api
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.Scenarios
import de.ttt.management.TestState
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/types`: the disciplines as the tournament module sees them. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class TypesResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var scenarios: Scenarios

    @BeforeEach
    fun setup() {
        testState.reset()
        scenarios.givenMatchesInEveryState()
    }

    @Test
    fun `all disciplines, doubles named with the -Doppel suffix`() {
        api.get("/types/all").expectStatus().isOk.expectJson("types/all")
    }

    @Test
    fun `the active disciplines`() {
        api.get("/types/open/all").expectStatus().isOk.expectJson("types/open-all")
    }
}
