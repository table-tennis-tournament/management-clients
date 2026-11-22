package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.Discipline
import de.ttt.management.registration.domain.discipline.DisciplineRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
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
}
