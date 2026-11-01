package de.ttt.management.grouping.infrastructure.database

import de.ttt.management.grouping.domain.GroupMatchRepository
import de.ttt.management.grouping.domain.GroupMatchResult
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository

@Repository
class JdbcGroupMatchRepository(private val jdbcClient: JdbcClient) : GroupMatchRepository {

    private val rowMapper = RowMapper { rs, _ ->
        GroupMatchResult(
            matchId = rs.getLong("matc_id"),
            groupId = rs.getObject("matc_grou_id")?.let { (it as Number).toLong() },
            player1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() },
            player2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() },
            sets1 = rs.getInt("matc_sets1"),
            sets2 = rs.getInt("matc_sets2"),
            balls1 = rs.getInt("matc_balls1"),
            balls2 = rs.getInt("matc_balls2"),
            isPlayed = rs.getBoolean("matc_played")
        )
    }

    override fun findByMatchId(matchId: Long): GroupMatchResult? =
        jdbcClient.sql("SELECT * FROM matches WHERE matc_id = :matchId")
            .param("matchId", matchId)
            .query(rowMapper)
            .optional()
            .orElse(null)

    override fun findByGroupId(groupId: Long): List<GroupMatchResult> =
        jdbcClient.sql("SELECT * FROM matches WHERE matc_grou_id = :groupId")
            .param("groupId", groupId)
            .query(rowMapper)
            .list()
}
