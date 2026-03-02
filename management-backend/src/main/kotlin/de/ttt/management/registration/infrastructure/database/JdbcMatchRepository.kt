package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.match.Match
import de.ttt.management.registration.domain.match.MatchRepository
import de.ttt.management.registration.domain.match.MatchType
import de.ttt.management.registration.domain.match.PlayGroup
import de.ttt.management.registration.domain.player.Player
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.sql.Timestamp
import java.util.*

@Repository
class JdbcMatchRepository(private val jdbcClient: JdbcClient) : MatchRepository {

    private val rowMapper = RowMapper { rs, _ ->
        val p1Id = rs.getObject("matc_play1_id", Long::class.java)
        val p2Id = rs.getObject("matc_play2_id", Long::class.java)
        val wId = rs.getObject("matc_winner_id", Long::class.java)
        val pgId = rs.getObject("matc_grou_id", Long::class.java)
        val mtId = rs.getObject("matc_ma_ty_id", Long::class.java)
        
        Match(
            id = rs.getLong("matc_id"),
            player1 = p1Id?.let { Player(id = it) },
            player2 = p2Id?.let { Player(id = it) },
            winner = wId?.let { Player(id = it) },
            playGroup = pgId?.let { PlayGroup(id = it) },
            matchType = mtId?.let { MatchType(id = it) },
            result = rs.getString("matc_result"),
            resultRaw = rs.getString("matc_result_raw"),
            sets1 = rs.getInt("matc_sets1"),
            sets2 = rs.getInt("matc_sets2"),
            balls1 = rs.getInt("matc_balls1"),
            balls2 = rs.getInt("matc_balls2"),
            isPlayed = rs.getBoolean("matc_played"),
            isPlaying = rs.getBoolean("matc_is_playing"),
            nr = rs.getInt("matc_nr"),
            roundNumber = rs.getInt("matc_round_number"),
            startTime = rs.getTimestamp("matc_start_time")?.toLocalDateTime()
        )
    }

    override fun findAll(): List<Match> {
        return jdbcClient.sql("SELECT * FROM matches").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<Match> {
        return jdbcClient.sql("SELECT * FROM matches WHERE matc_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(match: Match): Match {
        if (match.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("""
                INSERT INTO matches (matc_play1_id, matc_play2_id, matc_winner_id, matc_grou_id, matc_ma_ty_id, matc_result, matc_result_raw, 
                matc_sets1, matc_sets2, matc_balls1, matc_balls2, matc_played, matc_is_playing, matc_nr, matc_round_number, matc_start_time)
                VALUES (:p1, :p2, :w, :pg, :mt, :res, :resRaw, :s1, :s2, :b1, :b2, :played, :playing, :nr, :round, :start)
            """.trimIndent())
                .param("p1", match.player1?.id)
                .param("p2", match.player2?.id)
                .param("w", match.winner?.id)
                .param("pg", match.playGroup?.id)
                .param("mt", match.matchType?.id)
                .param("res", match.result)
                .param("resRaw", match.resultRaw)
                .param("s1", match.sets1)
                .param("s2", match.sets2)
                .param("b1", match.balls1)
                .param("b2", match.balls2)
                .param("played", match.isPlayed)
                .param("playing", match.isPlaying)
                .param("nr", match.nr)
                .param("round", match.roundNumber)
                .param("start", match.startTime?.let { Timestamp.valueOf(it) })
                .update(keyHolder)
            match.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("""
                UPDATE matches SET matc_play1_id = :p1, matc_play2_id = :p2, matc_winner_id = :w, matc_grou_id = :pg, matc_ma_ty_id = :mt, 
                matc_result = :res, matc_result_raw = :resRaw, matc_sets1 = :s1, matc_sets2 = :s2, matc_balls1 = :b1, matc_balls2 = :b2, 
                matc_played = :played, matc_is_playing = :playing, matc_nr = :nr, matc_round_number = :round, matc_start_time = :start
                WHERE matc_id = :id
            """.trimIndent())
                .param("p1", match.player1?.id)
                .param("p2", match.player2?.id)
                .param("w", match.winner?.id)
                .param("pg", match.playGroup?.id)
                .param("mt", match.matchType?.id)
                .param("res", match.result)
                .param("resRaw", match.resultRaw)
                .param("s1", match.sets1)
                .param("s2", match.sets2)
                .param("b1", match.balls1)
                .param("b2", match.balls2)
                .param("played", match.isPlayed)
                .param("playing", match.isPlaying)
                .param("nr", match.nr)
                .param("round", match.roundNumber)
                .param("start", match.startTime?.let { Timestamp.valueOf(it) })
                .param("id", match.id)
                .update()
        }
        return match
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM matches").update()
    }
}
