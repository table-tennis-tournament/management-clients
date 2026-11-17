package de.ttt.management.printer

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
import de.ttt.management.settings.application.PrinterService
import org.junit.jupiter.api.Assumptions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import tools.jackson.databind.json.JsonMapper
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class PrinterModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var printerService: PrinterService

    @Autowired
    private lateinit var db: DatabaseHelper

    /** Match 1 (players 1 vs 2) of discipline 1, group A, on table 1. */
    @BeforeEach
    fun setup() {
        db.clean()
        db.insertDiscipline(1, "Herren")
        db.insertGroup(1, "A", disciplineId = 1)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertTable(1)
        db.insertPlayer(1, "Jane", "Doe")
        db.insertPlayer(2, "John", "Roe")
        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1, tableId = 1)
    }

    @Test
    fun `should get all printers`() {
        restTestClient.get()
            .uri("/api/v2/printer/all")
            .exchange()
            .expectStatus().isOk
            // the printers depend on the machine, so compare with what the gateway reports
            .expectExactJson(JsonMapper.builder().build().writeValueAsString(printerService.getAllPrinters()))
    }

    private fun expectSelectedPrinter(name: String) {
        restTestClient.get()
            .uri("/api/v2/settings/all")
            .exchange()
            .expectStatus().isOk
            .expectExactJson(
                """[
                    {"key": "printerName", "value": "$name"},
                    {"key": "alwaysPrint", "value": true},
                    {"key": "autoStart", "value": false}
                ]"""
            )
    }

    @Test
    fun `should set an available printer and unset it again`() {
        val printers = printerService.getAllPrinters()
        Assumptions.assumeTrue(printers.isNotEmpty(), "no system printers available")

        restTestClient.post()
            .uri("/api/v2/printer/set/{name}", printers.first())
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
        expectSelectedPrinter(printers.first())

        restTestClient.delete()
            .uri("/api/v2/printer/set")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
        expectSelectedPrinter("")
    }

    @Test
    fun `unsetting the printer without a selection keeps the default`() {
        restTestClient.delete()
            .uri("/api/v2/printer/set")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
        expectSelectedPrinter("")
    }

    @Test
    fun `should fail to set non-existent printer`() {
        restTestClient.post()
            .uri("/api/v2/printer/set/DefinitelyNotARealPrinter12345")
            .exchange()
            .expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Printer not found"}""")
    }

    @Test
    fun `should set print on start`() {
        // print on start is on by default and kept in memory: switch it off, read it back, switch it on again
        restTestClient.post()
            .uri("/api/v2/printer/setprintonstart/false")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        try {
            restTestClient.get()
                .uri("/api/v2/settings/all")
                .exchange()
                .expectStatus().isOk
                .expectExactJson(
                    """[
                        {"key": "printerName", "value": ""},
                        {"key": "alwaysPrint", "value": false},
                        {"key": "autoStart", "value": false}
                    ]"""
                )
        } finally {
            printerService.setPrintOnStart(true)
        }
    }

    @Test
    fun `printing an unknown match returns bad request`() {
        restTestClient.post()
            .uri("/api/v2/printer/print/999999")
            .exchange()
            .expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Match not found or error printing"}""")
    }

    @Test
    fun `should get qr code`() {
        restTestClient.get()
            .uri("/api/v2/printer/getQrCode/some-content")
            .exchange()
            .expectStatus().isOk
            .expectHeader().contentType(MediaType.IMAGE_PNG)
    }

    @Test
    fun `should generate a match pdf`() {
        restTestClient.get()
            .uri("/api/v2/printer/printpdf/1")
            .exchange()
            .expectStatus().isOk
            .expectHeader().contentType(MediaType.APPLICATION_PDF)
            .expectBody()
            .consumeWith { result ->
                val bytes = result.responseBody ?: ByteArray(0)
                assertTrue(bytes.size > 4)
                assertTrue(String(bytes.copyOfRange(0, 4)) == "%PDF")
            }
    }

    @Test
    fun `should return 404 for a pdf of an unknown match`() {
        restTestClient.get()
            .uri("/api/v2/printer/printpdf/999999")
            .exchange()
            .expectStatus().isNotFound
            .expectBody().isEmpty()
    }
}
