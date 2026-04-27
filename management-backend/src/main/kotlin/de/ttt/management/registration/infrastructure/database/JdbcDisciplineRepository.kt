package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.Discipline
import de.ttt.management.registration.domain.discipline.DisciplineRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcDisciplineRepository(private val jdbcClient: JdbcClient) : DisciplineRepository {

    private val rowMapper = RowMapper { rs, _ ->
        Discipline(
            id = rs.getLong("type_id"),
            name = rs.getString("type_name"),
            kind = rs.getInt("type_kind"),
            active = rs.getInt("type_active") > 0
        )
    }

    override fun findAll(): List<Discipline> {
        return jdbcClient.sql("SELECT * FROM type").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<Discipline> {
        return jdbcClient.sql("SELECT * FROM type WHERE type_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(discipline: Discipline): Discipline {
        if (discipline.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO type (type_name, type_kind, type_active) VALUES (:name, :kind, :active)")
                .param("name", discipline.name)
                .param("kind", discipline.kind)
                .param("active", if (discipline.active) 1 else 0)
                .update(keyHolder)
            discipline.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE type SET type_name = :name, type_kind = :kind, type_active = :active WHERE type_id = :id")
                .param("name", discipline.name)
                .param("kind", discipline.kind)
                .param("active", if (discipline.active) 1 else 0)
                .param("id", discipline.id)
                .update()
        }
        return discipline
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM type").update()
    }
}
