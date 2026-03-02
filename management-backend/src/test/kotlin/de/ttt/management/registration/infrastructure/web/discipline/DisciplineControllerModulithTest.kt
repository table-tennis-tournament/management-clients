package de.ttt.management.registration.infrastructure.web.discipline

import de.ttt.management.registration.application.DisciplineColorData
import de.ttt.management.registration.domain.discipline.Discipline
import de.ttt.management.registration.domain.discipline.DisciplineColor
import de.ttt.management.registration.infrastructure.database.DisciplineColorRepository
import de.ttt.management.registration.infrastructure.database.DisciplineRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.resttestclient.TestRestTemplate
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureTestRestTemplate
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.modulith.test.ApplicationModuleTest

@ApplicationModuleTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@AutoConfigureTestRestTemplate
class DisciplineControllerModulithTest {

    @Autowired
    lateinit var restTemplate: TestRestTemplate

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

        val response = restTemplate.getForEntity("/api/disciplines", Array<Discipline>::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isNotNull
        assertThat(response.body!!.size).isEqualTo(2)
        assertThat(response.body!!.map { it.name }).containsExactlyInAnyOrder("Men Singles", "Women Singles")
    }

    @Test
    fun `getAllDisciplines returns empty list when no data exists`() {
        // Without data case
        val response = restTemplate.getForEntity("/api/disciplines", Array<Discipline>::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isNotNull
        assertThat(response.body).isEmpty()
    }

    @Test
    fun `getAllDisciplines with invalid query parameter still succeeds`() {
        // "Invalid" request case - GET usually ignores unknown parameters
        val response = restTemplate.getForEntity("/api/disciplines?unknown=param", Array<Discipline>::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
    }

    // --- GET /api/disciplines/active ---

    @Test
    fun `getActiveDisciplines returns only active ones successfully`() {
        // Success case
        disciplineRepository.save(Discipline(name = "Active Discipline", active = true))
        disciplineRepository.save(Discipline(name = "Inactive Discipline", active = false))

        val response = restTemplate.getForEntity("/api/disciplines/active", Array<Discipline>::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isNotNull
        assertThat(response.body!!.size).isEqualTo(1)
        assertThat(response.body!!.first().name).isEqualTo("Active Discipline")
    }

    @Test
    fun `getActiveDisciplines returns empty list when no active data exists`() {
        // Without data case
        disciplineRepository.save(Discipline(name = "Inactive Discipline", active = false))

        val response = restTemplate.getForEntity("/api/disciplines/active", Array<Discipline>::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isEmpty()
    }

    @Test
    fun `getActiveDisciplines with unknown parameter still succeeds`() {
        // Invalid/Unexpected request case
        val response = restTemplate.getForEntity("/api/disciplines/active?foo=bar", Array<Discipline>::class.java)
        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
    }

    // --- GET /api/disciplines/colors ---

    @Test
    fun `getAllTypeColors returns map of colors successfully`() {
        // Success case
        val discipline = disciplineRepository.save(Discipline(name = "Colored Discipline", active = true))
        disciplineColorRepository.save(DisciplineColor(discipline = discipline, bgColor = "blue", textColor = "white"))

        val response = restTemplate.getForEntity("/api/disciplines/colors", Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isNotNull
        @Suppress("UNCHECKED_CAST")
        val body = response.body as Map<String, Any>
        assertThat(body).containsKey(discipline.id.toString())
    }

    @Test
    fun `getAllTypeColors returns empty map when no colors exist`() {
        // Without data case
        val response = restTemplate.getForEntity("/api/disciplines/colors", Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isEmpty()
    }

    @Test
    fun `getAllTypeColors returns empty map even if disciplines exist without colors`() {
        // Variation: data exists in disciplines but not in colors
        disciplineRepository.save(Discipline(name = "No Color Discipline", active = true))

        val response = restTemplate.getForEntity("/api/disciplines/colors", Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body).isEmpty()
    }

    // --- POST /api/disciplines/{id}/color ---

    @Test
    fun `saveTypeColor saves color successfully`() {
        // Success case
        val discipline = disciplineRepository.save(Discipline(name = "Test Discipline", active = true))
        val colorData = DisciplineColorData(bgColor = "green", textColor = "black")

        val response = restTemplate.postForEntity("/api/disciplines/${discipline.id}/color", colorData, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.get("success")).isEqualTo(true)

        val savedColor = disciplineColorRepository.findAll().first()
        assertThat(savedColor.bgColor).isEqualTo("green")
        assertThat(savedColor.textColor).isEqualTo("black")
    }

    @Test
    fun `saveTypeColor returns failure for non-existing id`() {
        // Without data case (non-existing ID)
        val colorData = DisciplineColorData(bgColor = "red", textColor = "white")

        val response = restTemplate.postForEntity("/api/disciplines/99999/color", colorData, Map::class.java)

        assertThat(response.statusCode).isEqualTo(HttpStatus.OK)
        assertThat(response.body?.get("success")).isEqualTo(false)
    }

    @Test
    fun `saveTypeColor returns error for invalid request body format`() {
        // Invalid request case: wrong format
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_JSON
        val entity = HttpEntity("""{"wrong": "format"}""", headers)
        
        val response = restTemplate.postForEntity("/api/disciplines/1/color", entity, Map::class.java)

        // Missing required fields in DisciplineColorData (non-nullable Kotlin properties) 
        // should result in a 400 Bad Request during deserialization
        assertThat(response.statusCode).isEqualTo(HttpStatus.BAD_REQUEST)
    }
}
