package de.ttt.management.table

import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcMatchOnTableRepository(private val jdbcClient: JdbcClient) : MatchOnTableRepository {

    // Legacy schema often stores table assignment directly in the matches table (matc_tabl_id)
    // If a separate match_on_table exists, we use it. If not, we might map to the matches table.
    // Based on previous grep, matc_tabl_id exists in matches table.
    
    private val rowMapper = RowMapper { rs, _ ->
        MatchOnTable(
            id = UUID.fromString(rs.getString("id")),
            matchId = rs.getLong("match_id"),
            tableId = rs.getLong("table_id")
        )
    }

    override fun findAll(): List<MatchOnTable> {
        return jdbcClient.sql("SELECT * FROM match_on_table").query(rowMapper).list()
    }

    override fun findById(id: UUID): Optional<MatchOnTable> {
        return jdbcClient.sql("SELECT * FROM match_on_table WHERE id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(matchOnTable: MatchOnTable): MatchOnTable {
        if (matchOnTable.id == null) {
            matchOnTable.id = UUID.randomUUID()
            jdbcClient.sql("INSERT INTO match_on_table (id, match_id, table_id) VALUES (:id, :matchId, :tableId)")
                .param("id", matchOnTable.id.toString())
                .param("matchId", matchOnTable.matchId)
                .param("tableId", matchOnTable.tableId)
                .update()
        } else {
            jdbcClient.sql("UPDATE match_on_table SET match_id = :matchId, table_id = :tableId WHERE id = :id")
                .param("matchId", matchOnTable.matchId)
                .param("tableId", matchOnTable.tableId)
                .param("id", matchOnTable.id.toString())
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
