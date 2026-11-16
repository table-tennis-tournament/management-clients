package de.ttt.management.settings

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
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
class SettingsModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var db: DatabaseHelper

    @BeforeEach
    fun setup() {
        db.clean()
    }

    @Test
    fun `should get all settings`() {
        restTestClient.get()
            .uri("/api/v2/settings/all")
            .exchange()
            .expectStatus().isOk
            .expectExactJson(
                """[
                    {"key": "printerName", "value": ""},
                    {"key": "alwaysPrint", "value": true},
                    {"key": "autoStart", "value": false}
                ]"""
            )
    }
}
