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
        val discipline = Discipline(id = rs.getLong("tyco_type_id"))
        DisciplineColor(
            id = rs.getLong("tyco_id"),
            discipline = discipline,
            bgColor = rs.getString("tyco_bg_color"),
            textColor = rs.getString("tyco_text_color")
        )
    }

    override fun findAll(): List<DisciplineColor> {
        return jdbcClient.sql("SELECT * FROM typecolors")
            .query(rowMapper)
            .list()
    }

    override fun findByDisciplineId(disciplineId: Long): Optional<DisciplineColor> {
        return jdbcClient.sql("SELECT * FROM typecolors WHERE tyco_type_id = :id")
            .param("id", disciplineId)
            .query(rowMapper)
            .optional()
    }

    override fun save(disciplineColor: DisciplineColor): DisciplineColor {
        if (disciplineColor.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO typecolors (tyco_type_id, tyco_bg_color, tyco_text_color) VALUES (:disciplineId, :bgColor, :textColor)")
                .param("disciplineId", disciplineColor.discipline?.id)
                .param("bgColor", disciplineColor.bgColor)
                .param("textColor", disciplineColor.textColor)
                .update(keyHolder)
            disciplineColor.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE typecolors SET tyco_type_id = :disciplineId, tyco_bg_color = :bgColor, tyco_text_color = :textColor WHERE tyco_id = :id")
                .param("disciplineId", disciplineColor.discipline?.id)
                .param("bgColor", disciplineColor.bgColor)
                .param("textColor", disciplineColor.textColor)
                .param("id", disciplineColor.id)
                .update()
        }
        return disciplineColor
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM typecolors").update()
    }
}
