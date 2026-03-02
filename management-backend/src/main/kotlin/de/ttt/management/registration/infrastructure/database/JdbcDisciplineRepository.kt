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
            id = rs.getLong("Type_ID"),
            name = rs.getString("Type_Name"),
            kind = rs.getInt("Type_Kind"),
            active = rs.getBoolean("Type_Active")
        )
    }

    override fun findAll(): List<Discipline> {
        return jdbcClient.sql("SELECT * FROM type")
            .query(rowMapper)
            .list()
    }

    override fun findById(id: Long): Optional<Discipline> {
        return jdbcClient.sql("SELECT * FROM type WHERE Type_ID = :id")
            .param("id", id)
            .query(rowMapper)
            .optional()
    }

    override fun save(discipline: Discipline): Discipline {
        if (discipline.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO type (Type_Name, Type_Kind, Type_Active) VALUES (:name, :kind, :active)")
                .param("name", discipline.name)
                .param("kind", discipline.kind)
                .param("active", discipline.active)
                .update(keyHolder)
            discipline.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE type SET Type_Name = :name, Type_Kind = :kind, Type_Active = :active WHERE Type_ID = :id")
                .param("name", discipline.name)
                .param("kind", discipline.kind)
                .param("active", discipline.active)
                .param("id", discipline.id)
                .update()
        }
        return discipline
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM type").update()
    }
}
