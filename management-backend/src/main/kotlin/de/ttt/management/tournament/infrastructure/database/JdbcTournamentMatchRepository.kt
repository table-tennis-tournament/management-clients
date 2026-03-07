package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.*
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
class JdbcTournamentMatchRepository(private val jdbcClient: JdbcClient) : TournamentMatchRepository {

    private val rowMapper = RowMapper { rs, _ ->
        val p1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() }
        val p2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() }
        val wId = rs.getObject("matc_winner_id")?.let { (it as Number).toLong() }
        val pgId = rs.getObject("matc_grou_id")?.let { (it as Number).toLong() }
        val mtId = rs.getObject("matc_maty_id")?.let { (it as Number).toLong() }
        
        TournamentMatch(
            id = rs.getLong("matc_id"),
            player1 = p1Id?.let { TournamentPlayer(id = it) },
            player2 = p2Id?.let { TournamentPlayer(id = it) },
            winner = wId?.let { TournamentPlayer(id = it) },
            playGroup = pgId?.let { TournamentPlayGroup(id = it) },
            matchType = mtId?.let { TournamentMatchType(id = it) },
            result = rs.getString("matc_result"),
            resultRaw = rs.getString("matc_resultraw"),
            sets1 = rs.getInt("matc_sets1"),
            sets2 = rs.getInt("matc_sets2"),
            balls1 = rs.getInt("matc_balls1"),
            balls2 = rs.getInt("matc_balls2"),
            isPlayed = rs.getBoolean("matc_played"),
            isPlaying = rs.getBoolean("matc_isplaying"),
            nr = rs.getInt("matc_nr"),
            roundNumber = rs.getInt("matc_roundnumber"),
            startTime = rs.getTimestamp("matc_starttime")?.toLocalDateTime()
        )
    }

    override fun findAll(): List<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun findByTypeId(typeId: Long): List<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_type_id = :typeId")
            .param("typeId", typeId).query(rowMapper).list()
    }

    override fun findOpen(): List<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_played = 0").query(rowMapper).list()
    }

    override fun findOpenByTypeId(typeId: Long): List<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_type_id = :typeId AND matc_played = 0")
            .param("typeId", typeId).query(rowMapper).list()
    }

    override fun findPlayed(): List<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_played = 1").query(rowMapper).list()
    }

    override fun findPlayedByTypeId(typeId: Long): List<TournamentMatch> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_type_id = :typeId AND matc_played = 1")
            .param("typeId", typeId).query(rowMapper).list()
    }

    override fun isMatchPlaying(matchId: Long): Boolean {
        val result = jdbcClient.sql("SELECT matc_isplaying FROM matches WHERE matc_id = :id")
            .param("id", matchId)
            .query(Int::class.java)
            .optional()

        return result.orElse(0) > 0
    }

    override fun startMatch(matchId: Long, tableId: Long, startTime: LocalDateTime): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_isplaying = 1, matc_tabl_id = :tableId, matc_starttime = :startTime
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("tableId", tableId)
            .param("startTime", startTime)
            .param("id", matchId)
            .update()
    }

    override fun stopMatch(matchId: Long): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_isplaying = 0, matc_tabl_id = NULL
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("id", matchId)
            .update()
    }

    override fun freeMatch(matchId: Long): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_isplaying = 0, matc_played = 1, matc_tabl_id = NULL
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("id", matchId)
            .update()
    }

    override fun takeBackMatch(matchId: Long): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_isplaying = 0, matc_played = 0, matc_tabl_id = NULL
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("id", matchId)
            .update()
    }

    override fun updateResult(matchId: Long, resultRaw: String, sets1: Int, sets2: Int): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_resultraw = :resultRaw, matc_sets1 = :sets1, matc_sets2 = :sets2, matc_played = 1, matc_isplaying = 0, matc_tabl_id = NULL
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("resultRaw", resultRaw)
            .param("sets1", sets1)
            .param("sets2", sets2)
            .param("id", matchId)
            .update()
    }

    override fun deleteById(id: Long): Int {
        return jdbcClient.sql("DELETE FROM matches WHERE matc_id = :id").param("id", id).update()
    }

    override fun deleteByTypeId(typeId: Long): Int {
        return jdbcClient.sql("DELETE FROM matches WHERE matc_type_id = :typeId").param("typeId", typeId).update()
    }
}
