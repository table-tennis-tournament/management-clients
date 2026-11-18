package de.ttt.management

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
class OpenApiIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Test
    fun `the API description lists the api v2 endpoints`() {
        restTestClient.get()
            .uri("/v3/api-docs")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.paths['/api/v2/match/all']").exists()
            .jsonPath("$.paths['/api/v2/table/{nr}/lock']").exists()
    }

    @Test
    fun `the Swagger UI finds its configuration`() {
        restTestClient.get()
            .uri("/v3/api-docs/swagger-config")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.url").isEqualTo("/v3/api-docs")
    }
}
