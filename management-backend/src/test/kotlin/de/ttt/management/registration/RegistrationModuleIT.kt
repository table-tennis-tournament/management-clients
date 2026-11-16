package de.ttt.management.registration

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.client.RestTestClient

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class RegistrationModuleIT {

    @Autowired
    private lateinit var restTestClient: RestTestClient

    @Autowired
    private lateinit var db: DatabaseHelper

    /**
     * Club 1, disciplines 1 and 2, players 1 and 2 (club 1) registered for discipline 1,
     * player 3 (no club, no registration), and a color for discipline 2. Discipline 3 is inactive.
     */
    @BeforeEach
    fun setup() {
        db.clean()
        db.insertClub(1, "TTC Musterstadt")
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Damen")
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertPlayer(1, "Jane", "Doe", ttr = 1600, sex = "w", clubId = 1)
        db.insertPlayer(2, "John", "Roe", ttr = 1500, sex = "m", clubId = 1)
        db.insertPlayer(3, "Max", "Mustermann")
        db.insertRegistration(1, playerId = 1, disciplineId = 1)
        db.insertRegistration(2, playerId = 2, disciplineId = 1)
        db.insertDisciplineColor(2, "#ff0000", "#fff")
    }

    @Test
    fun `should get all players`() {
        restTestClient.get()
            .uri("/api/v2/players")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/players")
    }

    @Test
    fun `the legacy all players endpoint returns the same players`() {
        restTestClient.get()
            .uri("/api/v2/players/all")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/players")
    }

    @Test
    fun `should get the registrations of disciplines without matches`() {
        restTestClient.get()
            .uri("/api/v2/players/allTypePerPlayer")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/all-type-per-player")
    }

    @Test
    fun `the load endpoint reports success`() {
        restTestClient.get()
            .uri("/api/v2/players/load")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")
    }

    @Test
    fun `should get player by id`() {
        restTestClient.get()
            .uri("/api/v2/players/1")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/player-1")
    }

    @Test
    fun `should return 404 for non-existent player`() {
        restTestClient.get()
            .uri("/api/v2/players/9999")
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `should get players by type`() {
        restTestClient.get()
            .uri("/api/v2/players/type/1")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/players-type-1")
    }

    @Test
    fun `should return empty list for non-existent type`() {
        restTestClient.get()
            .uri("/api/v2/players/type/9999")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("[]")
    }

    @Test
    fun `should fail to set player active state for non-existent player`() {
        restTestClient.post()
            .uri("/api/v2/players/9999/active/true")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should persist player active state`() {
        restTestClient.post()
            .uri("/api/v2/players/1/active/false")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        restTestClient.get()
            .uri("/api/v2/players/1")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/player-1-inactive")
    }

    @Test
    fun `should fail setPayed with invalid id format`() {
        restTestClient.post()
            .uri("/api/v2/players/abc/paid?paid=true")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `should get all type colors`() {
        restTestClient.get()
            .uri("/api/v2/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `should get all disciplines`() {
        restTestClient.get()
            .uri("/api/v2/disciplines")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/disciplines")
    }

    @Test
    fun `should get the active disciplines`() {
        restTestClient.get()
            .uri("/api/v2/disciplines/active")
            .exchange()
            .expectStatus().isOk
            .expectJson("registration/disciplines-active")
    }

    @Test
    fun `should save type color successfully`() {
        val colorData = mapOf("bgColor" to "red", "textColor" to "white")
        restTestClient.post()
            .uri("/api/v2/disciplines/1/color")
            .contentType(MediaType.APPLICATION_JSON)
            .body(colorData)
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        restTestClient.get()
            .uri("/api/v2/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectExactJson(
                """{"1": {"bgColor": "red", "textColor": "white"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}"""
            )
    }

    @Test
    fun `should fail to save color for non-existent type`() {
        val colorData = mapOf("bgColor" to "red", "textColor" to "white")
        restTestClient.post()
            .uri("/api/v2/disciplines/9999/color")
            .contentType(MediaType.APPLICATION_JSON)
            .body(colorData)
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": false}""")
    }

    @Test
    fun `should save bulk colors successfully`() {
        val colors = mapOf("1" to mapOf("bgColor" to "blue", "textColor" to "black"))
        restTestClient.put()
            .uri("/api/v2/disciplines/colors")
            .contentType(MediaType.APPLICATION_JSON)
            .body(colors)
            .exchange()
            .expectStatus().isOk
            .expectExactJson("""{"success": true}""")

        restTestClient.get()
            .uri("/api/v2/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectExactJson(
                """{"1": {"bgColor": "blue", "textColor": "black"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}"""
            )
    }
}
