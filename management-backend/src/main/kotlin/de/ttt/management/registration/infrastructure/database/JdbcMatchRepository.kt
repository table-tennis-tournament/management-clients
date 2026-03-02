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
        val p1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() }
        val p2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() }
        val wId = rs.getObject("matc_winner_id")?.let { (it as Number).toLong() }
        val pgId = rs.getObject("matc_grou_id")?.let { (it as Number).toLong() }
        val mtId = rs.getObject("matc_maty_id")?.let { (it as Number).toLong() }
        
        Match(
            id = rs.getLong("matc_id"),
            player1 = p1Id?.let { Player(id = it) },
            player2 = p2Id?.let { Player(id = it) },
            winner = wId?.let { Player(id = it) },
            playGroup = pgId?.let { PlayGroup(id = it) },
            matchType = mtId?.let { MatchType(id = it) },
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
                INSERT INTO matches (matc_play1_id, matc_play2_id, matc_winner_id, matc_grou_id, matc_maty_id, matc_result, matc_resultraw, 
                matc_sets1, matc_sets2, matc_balls1, matc_balls2, matc_played, matc_isplaying, matc_nr, matc_roundnumber, matc_starttime)
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
                UPDATE matches SET matc_play1_id = :p1, matc_play2_id = :p2, matc_winner_id = :w, matc_grou_id = :pg, matc_maty_id = :mt, 
                matc_result = :res, matc_resultraw = :resRaw, matc_sets1 = :s1, matc_sets2 = :s2, matc_balls1 = :b1, matc_balls2 = :b2, 
                matc_played = :played, matc_isplaying = :playing, matc_nr = :nr, matc_roundnumber = :round, matc_starttime = :start
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
