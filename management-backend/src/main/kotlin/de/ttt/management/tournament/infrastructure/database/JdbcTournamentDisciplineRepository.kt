package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.TournamentDiscipline
import de.ttt.management.tournament.domain.TournamentDisciplineRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcTournamentDisciplineRepository(private val jdbcClient: JdbcClient) : TournamentDisciplineRepository {

    private val rowMapper = RowMapper { rs, _ ->
        TournamentDiscipline(
            id = rs.getLong("type_id"),
            name = rs.getString("type_name"),
            kind = rs.getInt("type_kind"),
            active = rs.getInt("type_active") > 0
        )
    }

    override fun findAll(): List<TournamentDiscipline> {
        return jdbcClient.sql("SELECT * FROM type").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<TournamentDiscipline> {
        return jdbcClient.sql("SELECT * FROM type WHERE type_id = :id").param("id", id).query(rowMapper).optional()
    }
}
