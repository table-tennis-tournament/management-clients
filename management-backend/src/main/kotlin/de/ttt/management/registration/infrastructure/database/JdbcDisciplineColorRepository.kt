package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.Discipline
import de.ttt.management.registration.domain.discipline.DisciplineColor
import de.ttt.management.registration.domain.discipline.DisciplineColorRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcDisciplineColorRepository(private val jdbcClient: JdbcClient) : DisciplineColorRepository {

    private val rowMapper = RowMapper { rs, _ ->
        DisciplineColor(
            id = rs.getLong("tyco_id"),
            discipline = Discipline(id = rs.getLong("tyco_type_id")),
            bgColor = rs.getString("tyco_bg_color"),
            textColor = rs.getString("tyco_text_color")
        )
    }

    override fun findAll(): List<DisciplineColor> {
        return jdbcClient.sql("SELECT * FROM typecolors").query(rowMapper).list()
    }

    override fun findByDisciplineId(disciplineId: Long): Optional<DisciplineColor> {
        return jdbcClient.sql("SELECT * FROM typecolors WHERE tyco_type_id = :id")
            .param("id", disciplineId).query(rowMapper).optional()
    }

    override fun save(disciplineColor: DisciplineColor): DisciplineColor {
        val existing = findByDisciplineId(disciplineColor.discipline?.id ?: 0)
        if (existing.isEmpty) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO typecolors (tyco_type_id, tyco_bg_color, tyco_text_color) VALUES (:typeId, :bg, :text)")
                .param("typeId", disciplineColor.discipline?.id)
                .param("bg", disciplineColor.bgColor)
                .param("text", disciplineColor.textColor)
                .update(keyHolder)
            disciplineColor.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE typecolors SET tyco_bg_color = :bg, tyco_text_color = :text WHERE tyco_type_id = :typeId")
                .param("bg", disciplineColor.bgColor)
                .param("text", disciplineColor.textColor)
                .param("typeId", disciplineColor.discipline?.id)
                .update()
        }
        return disciplineColor
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM typecolors").update()
    }
}
