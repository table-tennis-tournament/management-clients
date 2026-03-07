package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.MatchOnTable
import de.ttt.management.tournament.domain.MatchOnTableRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcMatchOnTableRepository(private val jdbcClient: JdbcClient) : MatchOnTableRepository {

    private val rowMapper = RowMapper { rs, _ ->
        MatchOnTable(
            id = rs.getString("id"),
            matchId = rs.getLong("match_id"),
            tableId = rs.getLong("table_id")
        )
    }

    override fun findAll(): List<MatchOnTable> {
        return jdbcClient.sql("SELECT * FROM match_on_table").query(rowMapper).list()
    }

    override fun findById(id: String): Optional<MatchOnTable> {
        return jdbcClient.sql("SELECT * FROM match_on_table WHERE id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(matchOnTable: MatchOnTable): MatchOnTable {
        val id = matchOnTable.id ?: UUID.randomUUID().toString()
        val existing = if (matchOnTable.id != null) findById(matchOnTable.id!!) else Optional.empty()
        
        if (existing.isEmpty) {
            jdbcClient.sql("INSERT INTO match_on_table (id, match_id, table_id) VALUES (:id, :matchId, :tableId)")
                .param("id", id)
                .param("matchId", matchOnTable.matchId)
                .param("tableId", matchOnTable.tableId)
                .update()
            matchOnTable.id = id
        } else {
            jdbcClient.sql("UPDATE match_on_table SET match_id = :matchId, table_id = :tableId WHERE id = :id")
                .param("matchId", matchOnTable.matchId)
                .param("tableId", matchOnTable.tableId)
                .param("id", matchOnTable.id)
                .update()
        }
        return matchOnTable
    }

    override fun deleteByMatchId(matchId: Long) {
        jdbcClient.sql("DELETE FROM match_on_table WHERE match_id = :matchId").param("matchId", matchId).update()
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM match_on_table").update()
    }
}
