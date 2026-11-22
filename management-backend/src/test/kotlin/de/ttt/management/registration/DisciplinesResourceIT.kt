package de.ttt.management.registration

import de.ttt.management.Api
import de.ttt.management.DatabaseHelper
import de.ttt.management.ResourceTestConfiguration
import de.ttt.management.TestState
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** `/api/v2/disciplines`: the disciplines as the registration module sees them, their colors and short names. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureRestTestClient
@ActiveProfiles("test")
@Import(ResourceTestConfiguration::class)
class DisciplinesResourceIT {

    @Autowired
    private lateinit var api: Api

    @Autowired
    private lateinit var testState: TestState

    @Autowired
    private lateinit var db: DatabaseHelper

    private val success = """{"success": true}"""

    /** Disciplines 1 and 2, discipline 3 inactive; discipline 2 has the colors #ff0000 on #fff and the short name "D". */
    @BeforeEach
    fun setup() {
        testState.reset()
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Damen")
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertDisciplineColor(2, "#ff0000", "#fff")
        db.insertDisciplineShortName(2, "D")
    }

    private fun expectShortNames(json: String) {
        api.get("/disciplines/short-names").expectStatus().isOk.expectExactJson(json)
    }

    private fun expectColors(json: String) {
        api.get("/disciplines/colors").expectStatus().isOk.expectExactJson(json)
    }

    @Test
    fun `all disciplines`() {
        api.get("/disciplines").expectStatus().isOk.expectJson("disciplines/all")
    }

    @Test
    fun `the active disciplines`() {
        api.get("/disciplines/active").expectStatus().isOk.expectJson("disciplines/active")
    }

    @Test
    fun `the colors`() {
        expectColors("""{"2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `saves the colors of a discipline by name`() {
        api.post("/disciplines/1/color", mapOf("bgColor" to "red", "textColor" to "white")).expectStatus().isOk.expectExactJson(success)
        expectColors("""{"1": {"bgColor": "red", "textColor": "white"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `saves hex colors`() {
        api.post("/disciplines/1/color", mapOf("bgColor" to "#ffffff", "textColor" to "#000000")).expectStatus().isOk.expectExactJson(success)
        expectColors("""{"1": {"bgColor": "#ffffff", "textColor": "#000000"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `overwrites the colors of a discipline`() {
        api.post("/disciplines/2/color", mapOf("bgColor" to "#00ff00", "textColor" to "#000")).expectStatus().isOk.expectExactJson(success)
        expectColors("""{"2": {"bgColor": "#00ff00", "textColor": "#000"}}""")
    }

    @Test
    fun `saving the colors of an unknown discipline fails`() {
        api.post("/disciplines/9999/color", mapOf("bgColor" to "red", "textColor" to "white")).expectStatus().isOk
            .expectExactJson("""{"success": false}""")
    }

    @Test
    fun `a color longer than seven characters fails and changes nothing`() {
        api.post("/disciplines/1/color", mapOf("bgColor" to "#ffffff", "textColor" to "#0000000")).expectStatus().isOk
            .expectExactJson("""{"success": false}""")
        expectColors("""{"2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `saves the colors of several disciplines`() {
        api.put("/disciplines/colors", mapOf("1" to mapOf("bgColor" to "blue", "textColor" to "black")))
            .expectStatus().isOk.expectExactJson(success)
        expectColors("""{"1": {"bgColor": "blue", "textColor": "black"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `the short names`() {
        expectShortNames("""{"2": "D"}""")
    }

    @Test
    fun `saves the short name of a discipline, trimmed`() {
        api.put("/disciplines/1/short-name", mapOf("shortName" to " H ")).expectStatus().isOk.expectExactJson(success)
        expectShortNames("""{"1": "H", "2": "D"}""")
    }

    @Test
    fun `overwrites the short name of a discipline`() {
        api.put("/disciplines/2/short-name", mapOf("shortName" to "Da")).expectStatus().isOk.expectExactJson(success)
        expectShortNames("""{"2": "Da"}""")
    }

    @Test
    fun `a blank short name removes it`() {
        api.put("/disciplines/2/short-name", mapOf("shortName" to " ")).expectStatus().isOk.expectExactJson(success)
        expectShortNames("""{}""")
    }

    @Test
    fun `saving the short name of an unknown discipline fails`() {
        api.put("/disciplines/9999/short-name", mapOf("shortName" to "X")).expectStatus().isOk
            .expectExactJson("""{"success": false}""")
        expectShortNames("""{"2": "D"}""")
    }

    @Test
    fun `a short name longer than thirty characters fails and changes nothing`() {
        api.put("/disciplines/2/short-name", mapOf("shortName" to "x".repeat(31))).expectStatus().isOk
            .expectExactJson("""{"success": false}""")
        expectShortNames("""{"2": "D"}""")
    }
}
