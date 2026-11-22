package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.DisciplineShortNameRepository
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository

@Repository
class JdbcDisciplineShortNameRepository(private val jdbcClient: JdbcClient) : DisciplineShortNameRepository {

    override fun findAll(): Map<Long, String> =
        jdbcClient.sql("SELECT tysn_type_id, tysn_short_name FROM mgmt_type_short_name")
            .query { rs, _ -> rs.getLong("tysn_type_id") to rs.getString("tysn_short_name") }
            .list().toMap()

    override fun save(disciplineId: Long, shortName: String) {
        val updated = jdbcClient.sql("UPDATE mgmt_type_short_name SET tysn_short_name = :name WHERE tysn_type_id = :id")
            .param("name", shortName).param("id", disciplineId).update()
        if (updated == 0) {
            jdbcClient.sql("INSERT INTO mgmt_type_short_name (tysn_type_id, tysn_short_name) VALUES (:id, :name)")
                .param("id", disciplineId).param("name", shortName).update()
        }
    }

    override fun delete(disciplineId: Long) {
        jdbcClient.sql("DELETE FROM mgmt_type_short_name WHERE tysn_type_id = :id").param("id", disciplineId).update()
    }
}
