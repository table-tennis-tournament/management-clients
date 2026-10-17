package de.ttt.management.printer

import de.ttt.management.settings.application.PrinterService
import org.junit.jupiter.api.Assumptions
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient
import kotlin.test.assertTrue

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class PrinterModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var printerService: PrinterService

    @Test
    fun `should get all printers`() {
        restTestClient.get()
            .uri("/api/v2/printer/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNumber
    }

    @Test
    fun `should set an available printer successfully`() {
        val printers = printerService.getAllPrinters()
        Assumptions.assumeTrue(printers.isNotEmpty(), "no system printers available")

        restTestClient.post()
            .uri("/api/v2/printer/set/{name}", printers.first())
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should fail to set non-existent printer`() {
        restTestClient.post()
            .uri("/api/v2/printer/set/DefinitelyNotARealPrinter12345")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should set print on start`() {
        restTestClient.post()
            .uri("/api/v2/printer/setprintonstart/true")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
    }

    @Test
    fun `should print match successfully`() {
        restTestClient.post()
            .uri("/api/v2/printer/print/1")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)
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
    }
}
