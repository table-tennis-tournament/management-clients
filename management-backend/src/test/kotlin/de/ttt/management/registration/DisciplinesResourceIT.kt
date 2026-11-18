package de.ttt.management.registration

import de.ttt.management.ResourceIT
import de.ttt.management.expectExactJson
import de.ttt.management.expectJson
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

/** `/api/v2/disciplines`: the disciplines as the registration module sees them, and their colors. */
class DisciplinesResourceIT : ResourceIT() {

    private val success = """{"success": true}"""

    /** Disciplines 1 and 2, discipline 3 inactive; discipline 2 has the colors #ff0000 on #fff. */
    @BeforeEach
    fun setup() {
        db.insertDiscipline(1, "Herren")
        db.insertDiscipline(2, "Damen")
        db.insertDiscipline(3, "Senioren", active = false)
        db.insertDisciplineColor(2, "#ff0000", "#fff")
    }

    private fun expectColors(json: String) {
        get("/disciplines/colors").expectStatus().isOk.expectExactJson(json)
    }

    @Test
    fun `all disciplines`() {
        get("/disciplines").expectStatus().isOk.expectJson("disciplines/all")
    }

    @Test
    fun `the active disciplines`() {
        get("/disciplines/active").expectStatus().isOk.expectJson("disciplines/active")
    }

    @Test
    fun `the colors`() {
        expectColors("""{"2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `saves the colors of a discipline by name`() {
        post("/disciplines/1/color", mapOf("bgColor" to "red", "textColor" to "white")).expectStatus().isOk.expectExactJson(success)
        expectColors("""{"1": {"bgColor": "red", "textColor": "white"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `saves hex colors`() {
        post("/disciplines/1/color", mapOf("bgColor" to "#ffffff", "textColor" to "#000000")).expectStatus().isOk.expectExactJson(success)
        expectColors("""{"1": {"bgColor": "#ffffff", "textColor": "#000000"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `overwrites the colors of a discipline`() {
        post("/disciplines/2/color", mapOf("bgColor" to "#00ff00", "textColor" to "#000")).expectStatus().isOk.expectExactJson(success)
        expectColors("""{"2": {"bgColor": "#00ff00", "textColor": "#000"}}""")
    }

    @Test
    fun `saving the colors of an unknown discipline fails`() {
        post("/disciplines/9999/color", mapOf("bgColor" to "red", "textColor" to "white")).expectStatus().isOk
            .expectExactJson("""{"success": false}""")
    }

    @Test
    fun `a color longer than seven characters fails and changes nothing`() {
        post("/disciplines/1/color", mapOf("bgColor" to "#ffffff", "textColor" to "#0000000")).expectStatus().isOk
            .expectExactJson("""{"success": false}""")
        expectColors("""{"2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }

    @Test
    fun `saves the colors of several disciplines`() {
        put("/disciplines/colors", mapOf("1" to mapOf("bgColor" to "blue", "textColor" to "black")))
            .expectStatus().isOk.expectExactJson(success)
        expectColors("""{"1": {"bgColor": "blue", "textColor": "black"}, "2": {"bgColor": "#ff0000", "textColor": "#fff"}}""")
    }
}
