package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.DisciplineDisplay
import de.ttt.management.registration.domain.discipline.DisciplineDisplayRepository
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository

@Repository
class JdbcDisciplineDisplayRepository(private val jdbcClient: JdbcClient) : DisciplineDisplayRepository {

    override fun findAll(): List<DisciplineDisplay> =
        jdbcClient.sql("SELECT * FROM mgmt_type_display ORDER BY tydi_type_id")
            .query { rs, _ ->
                DisciplineDisplay(
                    disciplineId = rs.getLong("tydi_type_id"),
                    bgColor = rs.getString("tydi_bg_color"),
                    textColor = rs.getString("tydi_text_color"),
                    shortName = rs.getString("tydi_short_name")
                )
            }
            .list()

    override fun saveColors(disciplineId: Long, bgColor: String, textColor: String) {
        ensureRow(disciplineId)
        jdbcClient.sql("UPDATE mgmt_type_display SET tydi_bg_color = :bg, tydi_text_color = :text WHERE tydi_type_id = :id")
            .param("bg", bgColor).param("text", textColor).param("id", disciplineId).update()
    }

    override fun saveShortName(disciplineId: Long, shortName: String?) {
        ensureRow(disciplineId)
        jdbcClient.sql("UPDATE mgmt_type_display SET tydi_short_name = :name WHERE tydi_type_id = :id")
            .param("name", shortName).param("id", disciplineId).update()
    }

    private fun ensureRow(disciplineId: Long) {
        val exists = jdbcClient.sql("SELECT COUNT(*) FROM mgmt_type_display WHERE tydi_type_id = :id")
            .param("id", disciplineId).query(Long::class.java).single() > 0
        if (!exists) {
            jdbcClient.sql("INSERT INTO mgmt_type_display (tydi_type_id) VALUES (:id)").param("id", disciplineId).update()
        }
    }
}
