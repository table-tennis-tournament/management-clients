package de.ttt.management.printer

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class PrinterModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Test
    fun `should get all printers`() {
        restTestClient.get()
            .uri("/api/printer/all")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.length()").isNumber
    }
@Test
fun `should set printer successfully`() {
    val printerName = "TestPrinter"
    restTestClient.post()
        .uri("/api/printer/set/$printerName")
        .exchange()
        .expectStatus().isOk
        .expectBody()
        .jsonPath("$.success").isEqualTo(true)
}

@Test
fun `should fail to set non-existent printer`() {
    val printerName = "NonExistent"
    restTestClient.post()
        .uri("/api/printer/set/$printerName")
        .exchange()
        .expectStatus().isBadRequest
}

@Test
fun `should set print on start`() {
    restTestClient.post()
        .uri("/api/printer/setprintonstart/true")
        .exchange()
        .expectStatus().isOk
        .expectBody()
        .jsonPath("$.success").isEqualTo(true)
}

@Test
fun `should print match successfully`() {
    restTestClient.post()
        .uri("/api/printer/print/1")
        .exchange()
        .expectStatus().isOk
        .expectBody()
        .jsonPath("$.success").isEqualTo(true)
}

@Test
fun `should fail to print non-existent match`() {
    val matchId = 9999L
    restTestClient.post()
        .uri("/api/printer/print/$matchId")
        .exchange()
        .expectStatus().isBadRequest
}


    @Test
    fun `should get qr code`() {
        restTestClient.get()
            .uri("/api/printer/getQrCode/some-content")
            .exchange()
            .expectStatus().isOk
            .expectHeader().contentType(MediaType.IMAGE_PNG)
    }
}
