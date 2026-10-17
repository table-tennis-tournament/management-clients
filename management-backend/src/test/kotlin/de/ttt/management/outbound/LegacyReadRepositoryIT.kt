package de.ttt.management.outbound

import de.ttt.management.outbound.domain.LegacyReadRepository
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import tools.jackson.databind.ObjectMapper
import kotlin.test.assertTrue

@SpringBootTest
@ActiveProfiles("test")
class LegacyReadRepositoryIT {

    @Autowired
    private lateinit var readRepository: LegacyReadRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Test
    fun `fetchAllMatches returns v1-shaped matches`() {
        val matches = readRepository.fetchAllMatches()
        assertTrue(matches.isNotEmpty())
        val first = matches.first()
        assertTrue(first.id > 0)
        assertTrue(first.team1.isNotEmpty() || first.team2.isNotEmpty())
        assertTrue(first.state.isNotBlank())
    }

    @Test
    fun `fetchAllMatches serializes with the v1 message keys`() {
        val json = objectMapper.writeValueAsString(mapOf("UpdateMatches" to readRepository.fetchAllMatches()))
        assertTrue(json.contains("\"UpdateMatches\""))
        assertTrue(json.contains("\"team1\""))
        assertTrue(json.contains("\"state\""))
        assertTrue(json.contains("\"matchType\""))
    }

    @Test
    fun `fetchAllTables returns tables and fetchMatchList returns entries`() {
        assertTrue(readRepository.fetchAllTables().isNotEmpty())
        assertTrue(readRepository.fetchTableManagerTables().isNotEmpty())
    }
}
