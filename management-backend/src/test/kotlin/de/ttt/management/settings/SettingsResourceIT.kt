package de.ttt.management.settings

import de.ttt.management.Api
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/settings`: the runtime settings the admin view shows. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class SettingsResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @BeforeEach
    fun resetState() = testState.reset()

    @Test
    fun `the default settings`() {
        api.get("/settings/all").expectStatus().isOk.expectExactJson(
            """[
                {"key": "printerName", "value": ""},
                {"key": "alwaysPrint", "value": true},
                {"key": "autoStart", "value": false}
            ]"""
        )
    }

    @Test
    fun `the settings after changing all of them`() {
        api.post("/printer/set/Office").expectStatus().isOk
        api.post("/printer/setprintonstart/false").expectStatus().isOk
        api.post("/matchlist/active/true").expectStatus().isOk

        api.get("/settings/all").expectStatus().isOk.expectExactJson(
            """[
                {"key": "printerName", "value": "Office"},
                {"key": "alwaysPrint", "value": false},
                {"key": "autoStart", "value": true}
            ]"""
        )
    }
}
