package de.ttt.management.registration

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import de.ttt.management.expectExactJsonIgnoring
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/** `/api/v2/players`: players, their registrations, payment and activity. */
class PlayersResourceIT : ResourceIT() {

    private val success = """{"success": true}"""

    /**
     * Club 1, disciplines 1 and 2, players 1 and 2 (club 1) registered for discipline 1 (registrations 1 and 2,
     * not paid), player 3 (no club, no registration). Discipline 3 is inactive.
     */
    @BeforeEach
    fun setup() {
        db.insertClub(1, "TTC Musterstadt")
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Damen")
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertPlayer(1, "Jane", "Doe", ttr = 1600, sex = "w", clubId = 1)
        db.insertPlayer(2, "John", "Roe", ttr = 1500, sex = "m", clubId = 1)
        db.insertPlayer(3, "Max", "Mustermann")
        db.insertRegistration(1, playerId = 1, disciplineId = 1)
        db.insertRegistration(2, playerId = 2, disciplineId = 1)
    }

    @Test
    fun `all players`() {
        get("/players").expectStatus().isOk.expectJson("players/players")
    }

    @Test
    fun `the legacy all players path returns the same players`() {
        get("/players/all").expectStatus().isOk.expectJson("players/players")
    }

    @Test
    fun `a player by id`() {
        get("/players/1").expectStatus().isOk.expectJson("players/player-1")
    }

    @Test
    fun `an unknown player is not found`() {
        get("/players/9999").expectStatus().isNotFound.expectBody().isEmpty()
    }

    @Test
    fun `the players of a discipline`() {
        get("/players/type/1").expectStatus().isOk.expectJson("players/players-type-1")
    }

    @Test
    fun `an unknown discipline has no players`() {
        get("/players/type/9999").expectStatus().isOk.expectExactJson("[]")
    }

    @Test
    fun `the registrations of disciplines without matches`() {
        get("/players/allTypePerPlayer").expectStatus().isOk.expectJson("players/all-type-per-player")
    }

    @Test
    fun `a discipline with matches shows no registrations`() {
        db.insertMatch(1, 1, 2, disciplineId = 1)
        get("/players/allTypePerPlayer").expectStatus().isOk.expectExactJson("[]")
    }

    @Test
    fun `the load path is kept for the legacy clients`() {
        get("/players/load").expectStatus().isOk.expectExactJson(success)
    }

    @Test
    fun `registers a player`() {
        post("/players", mapOf("firstName" to "Erika", "lastName" to "Musterfrau", "ttr" to 1450, "sex" to "w", "clubId" to 1))
            .expectStatus().isOk.expectJson("players/registered")
        get("/players/4").expectStatus().isOk.expectJson("players/registered")
    }

    @Test
    fun `rejects registering a player without a name`() {
        post("/players", mapOf("lastName" to "Musterfrau")).expectStatus().isBadRequest
    }

    @Test
    fun `unregisters a player`() {
        post("/players/3/unregister").expectStatus().isOk.expectExactJson(success)
        get("/players/3").expectStatus().isNotFound
    }

    @Test
    fun `unregistering an unknown player fails`() {
        post("/players/9999/unregister").expectStatus().isOk.expectExactJson("""{"success": false}""")
    }

    @Test
    fun `records a payment for a registration`() {
        post("/players/1/paid?paid=true").expectStatus().isOk.expectExactJson(success)
        get("/players/allTypePerPlayer").expectStatus().isOk.expectJson("players/all-type-per-player-1-paid")

        post("/players/1/paid?paid=false").expectStatus().isOk.expectExactJson(success)
        get("/players/allTypePerPlayer").expectStatus().isOk.expectJson("players/all-type-per-player")
    }

    @Test
    fun `a payment for an unknown registration fails`() {
        post("/players/9999/paid?paid=true").expectStatus().isOk.expectExactJson("""{"success": false}""")
    }

    @Test
    fun `rejects a registration id that is no number`() {
        post("/players/abc/paid?paid=true").expectStatus().isBadRequest
            // Spring's default error body
            .expectExactJsonIgnoring(
                """{"timestamp": "ignored", "status": 400, "error": "Bad Request", "path": "/api/v2/players/abc/paid"}""",
                "timestamp"
            )
    }

    @Test
    fun `deactivates and activates a player`() {
        post("/players/1/active/false").expectStatus().isOk.expectExactJson(success)
        get("/players/1").expectStatus().isOk.expectJson("players/player-1-inactive")

        post("/players/1/active/true").expectStatus().isOk.expectExactJson(success)
        get("/players/1").expectStatus().isOk.expectJson("players/player-1")
    }

    @Test
    fun `rejects changing the activity of an unknown player`() {
        post("/players/9999/active/true").expectStatus().isBadRequest
            .expectExactJson("""{"success": false, "message": "Player not found"}""")
    }
}
