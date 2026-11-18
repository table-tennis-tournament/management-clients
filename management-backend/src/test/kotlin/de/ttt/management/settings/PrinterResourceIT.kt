package de.ttt.management.settings

import de.ttt.management.Api
import de.ttt.management.DatabaseHelper
import de.ttt.management.RecordingPrinterGateway
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles

/**
 * `/api/v2/printer`: printers, referee sheets and QR codes. The tests print on the
 * [RecordingPrinterGateway], which knows the printers "PDF" (the default) and "Office".
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class PrinterResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var db: DatabaseHelper

    @Autowired
    private lateinit var printer: RecordingPrinterGateway

    private val success = """{"success": true}"""

    /** Match 1 (players 1 vs 2) of discipline 1, group A, on table 1; match 2 (players 1 vs 2) is open. */
    @BeforeEach
    fun setup() {
        testState.reset()
        db.insertDiscipline(1, "Herren")
        db.insertGroup(1, "A", disciplineId = 1)
        db.insertMatchType(1, "Gruppenspiel")
        db.insertTables(1L..2L)
        db.insertPlayer(1, "Jane", "Doe")
        db.insertPlayer(2, "John", "Roe")
        db.insertMatch(1, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1, tableId = 1)
        db.insertMatch(2, 1, 2, disciplineId = 1, groupId = 1, matchTypeId = 1)
    }

    private fun isPdf(bytes: ByteArray) = bytes.size > 4 && String(bytes.copyOfRange(0, 4)) == "%PDF"

    private fun expectPrinted(vararg printers: String) {
        assertEquals(printers.toList(), printer.printed.map { it.printer })
        assertTrue(printer.printed.all { isPdf(it.pdf) }, "every job is a PDF")
    }

    private fun expectSelectedPrinter(name: String) {
        api.get("/settings/all").expectStatus().isOk.expectExactJson(
            """[
                {"key": "printerName", "value": "$name"},
                {"key": "alwaysPrint", "value": true},
                {"key": "autoStart", "value": false}
            ]"""
        )
    }

    // --- printers ------------------------------------------------------------------

    @Test
    fun `the printers`() {
        api.get("/printer/all").expectStatus().isOk.expectExactJson("""["PDF", "Office"]""")
    }

    @Test
    fun `selects a printer and unsets it again`() {
        api.post("/printer/set/Office").expectStatus().isOk.expectExactJson(success)
        expectSelectedPrinter("Office")

        api.delete("/printer/set").expectStatus().isOk.expectExactJson(success)
        expectSelectedPrinter("")
    }

    @Test
    fun `unsetting without a selection keeps the default`() {
        api.delete("/printer/set").expectStatus().isOk.expectExactJson(success)
        expectSelectedPrinter("")
    }

    @Test
    fun `rejects an unknown printer`() {
        api.post("/printer/set/DefinitelyNotARealPrinter12345").expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Printer not found"}""")
        expectSelectedPrinter("")
    }

    // --- printing --------------------------------------------------------------------

    @Test
    fun `prints a referee sheet on the default printer`() {
        api.post("/printer/print/1").expectStatus().isOk.expectExactJson(success)
        expectPrinted("PDF")
    }

    @Test
    fun `prints on the selected printer`() {
        api.post("/printer/set/Office").expectStatus().isOk
        api.post("/printer/print/1").expectStatus().isOk.expectExactJson(success)
        expectPrinted("Office")
    }

    @Test
    fun `rejects printing an unknown match`() {
        api.post("/printer/print/999999").expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Match not found or error printing"}""")
        expectPrinted()
    }

    @Test
    fun `prints several referee sheets`() {
        api.post("/printer/printAll", listOf(1, 2)).expectStatus().isOk.expectExactJson(success)
        expectPrinted("PDF", "PDF")
    }

    @Test
    fun `printing several sheets with an unknown match prints the others`() {
        api.post("/printer/printAll", listOf(1, 999999)).expectStatus().isOk.expectExactJson("""{"success": false}""")
        expectPrinted("PDF")
    }

    // --- print on assign ---------------------------------------------------------------

    @Test
    fun `assigning a match prints its referee sheet`() {
        api.post("/match/matchtotable/2", listOf(2)).expectStatus().isOk
        expectPrinted("PDF")
    }

    @Test
    fun `with print on assign switched off, assigning prints nothing`() {
        api.post("/printer/setprintonstart/false").expectStatus().isOk.expectExactJson(success)
        api.get("/settings/all").expectStatus().isOk.expectExactJson(
            """[
                {"key": "printerName", "value": ""},
                {"key": "alwaysPrint", "value": false},
                {"key": "autoStart", "value": false}
            ]"""
        )

        api.post("/match/matchtotable/2", listOf(2)).expectStatus().isOk
        expectPrinted()
    }

    // --- documents ---------------------------------------------------------------------

    @Test
    fun `the referee sheet as PDF`() {
        api.get("/printer/printpdf/1").expectStatus().isOk
            .expectHeader().contentType(MediaType.APPLICATION_PDF)
            .expectBody().consumeWith { assertTrue(isPdf(it.responseBody ?: ByteArray(0))) }
    }

    @Test
    fun `no PDF for an unknown match`() {
        api.get("/printer/printpdf/999999").expectStatus().isNotFound.expectBody().isEmpty()
    }

    @Test
    fun `a QR code`() {
        api.get("/printer/getQrCode/some-content").expectStatus().isOk
            .expectHeader().contentType(MediaType.IMAGE_PNG)
            .expectBody().consumeWith {
                val png = it.responseBody ?: ByteArray(0)
                // the PNG signature
                assertEquals(listOf(0x89, 0x50, 0x4E, 0x47), png.take(4).map { b -> b.toInt() and 0xFF })
            }
    }
}
