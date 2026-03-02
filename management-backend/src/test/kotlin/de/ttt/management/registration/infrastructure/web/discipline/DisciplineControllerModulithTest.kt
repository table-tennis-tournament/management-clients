package de.ttt.management.registration.infrastructure.web.discipline

import de.ttt.management.registration.application.DisciplineColorData
import de.ttt.management.registration.domain.discipline.Discipline
import de.ttt.management.registration.domain.discipline.DisciplineColor
import de.ttt.management.registration.domain.discipline.DisciplineColorRepository
import de.ttt.management.registration.domain.discipline.DisciplineRepository
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient
import org.springframework.http.MediaType
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.test.web.servlet.client.RestTestClient

@ApplicationModuleTest
@AutoConfigureRestTestClient
class DisciplineControllerModulithTest {

    @Autowired
    lateinit var restTestClient: RestTestClient

    @Autowired
    lateinit var disciplineRepository: DisciplineRepository

    @Autowired
    lateinit var disciplineColorRepository: DisciplineColorRepository

    @BeforeEach
    fun setup() {
        disciplineColorRepository.deleteAll()
        disciplineRepository.deleteAll()
    }

    // --- GET /api/disciplines ---

    @Test
    fun `getAllDisciplines returns all disciplines successfully`() {
        // Success case
        disciplineRepository.save(Discipline(name = "Men Singles", active = true))
        disciplineRepository.save(Discipline(name = "Women Singles", active = false))

        restTestClient.get().uri("/api/disciplines")
            .exchange()
            .expectStatus().isOk
            .expectBody(Array<Discipline>::class.java)
            .value { list ->
                assert(list!!.size == 2)
                assert(list.map { it.name }.containsAll(listOf("Men Singles", "Women Singles")))
            }
    }

    @Test
    fun `getAllDisciplines returns empty list when no data exists`() {
        // Without data case
        restTestClient.get().uri("/api/disciplines")
            .exchange()
            .expectStatus().isOk
            .expectBody(Array<Discipline>::class.java)
            .value { list ->
                assert(list!!.isEmpty())
            }
    }

    @Test
    fun `getAllDisciplines with invalid query parameter still succeeds`() {
        restTestClient.get().uri("/api/disciplines?unknown=param")
            .exchange()
            .expectStatus().isOk
    }

    // --- GET /api/disciplines/active ---

    @Test
    fun `getActiveDisciplines returns only active ones successfully`() {
        // Success case
        disciplineRepository.save(Discipline(name = "Active Discipline", active = true))
        disciplineRepository.save(Discipline(name = "Inactive Discipline", active = false))

        restTestClient.get().uri("/api/disciplines/active")
            .exchange()
            .expectStatus().isOk
            .expectBody(Array<Discipline>::class.java)
            .value { list ->
                assert(list!!.size == 1)
                assert(list.first().name == "Active Discipline")
            }
    }

    @Test
    fun `getActiveDisciplines returns empty list when no active data exists`() {
        // Without data case
        disciplineRepository.save(Discipline(name = "Inactive Discipline", active = false))

        restTestClient.get().uri("/api/disciplines/active")
            .exchange()
            .expectStatus().isOk
            .expectBody(Array<Discipline>::class.java)
            .value { list ->
                assert(list!!.isEmpty())
            }
    }

    @Test
    fun `getActiveDisciplines with unknown parameter still succeeds`() {
        restTestClient.get().uri("/api/disciplines/active?foo=bar")
            .exchange()
            .expectStatus().isOk
    }

    // --- GET /api/disciplines/colors ---

    @Test
    fun `getAllTypeColors returns map of colors successfully`() {
        // Success case
        val discipline = disciplineRepository.save(Discipline(name = "Colored Discipline", active = true))
        disciplineColorRepository.save(DisciplineColor(discipline = discipline, bgColor = "blue", textColor = "white"))

        restTestClient.get().uri("/api/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.['${discipline.id}']").exists()
    }

    @Test
    fun `getAllTypeColors returns empty map when no colors exist`() {
        // Without data case
        restTestClient.get().uri("/api/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectBody(Map::class.java)
            .isEqualTo(emptyMap<String, Any>())
    }

    @Test
    fun `getAllTypeColors returns empty map even if disciplines exist without colors`() {
        disciplineRepository.save(Discipline(name = "No Color Discipline", active = true))

        restTestClient.get().uri("/api/disciplines/colors")
            .exchange()
            .expectStatus().isOk
            .expectBody(Map::class.java)
            .isEqualTo(emptyMap<String, Any>())
    }

    // --- POST /api/disciplines/{id}/color ---

    @Test
    fun `saveTypeColor saves color successfully`() {
        // Success case
        val discipline = disciplineRepository.save(Discipline(name = "Test Discipline", active = true))
        val colorData = DisciplineColorData(bgColor = "green", textColor = "black")

        restTestClient.post().uri("/api/disciplines/${discipline.id}/color")
            .body(colorData)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(true)

        val savedColor = disciplineColorRepository.findAll().first()
        assert(savedColor.bgColor == "green")
        assert(savedColor.textColor == "black")
    }

    @Test
    fun `saveTypeColor returns failure for non-existing id`() {
        // Without data case (non-existing ID)
        val colorData = DisciplineColorData(bgColor = "red", textColor = "white")

        restTestClient.post().uri("/api/disciplines/99999/color")
            .body(colorData)
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.success").isEqualTo(false)
    }

    @Test
    fun `saveTypeColor returns error for invalid request body format`() {
        restTestClient.post().uri("/api/disciplines/1/color")
            .contentType(MediaType.APPLICATION_JSON)
            .body("""{"wrong": "format"}""")
            .exchange()
            .expectStatus().isBadRequest
    }
}
