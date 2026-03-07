package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.TournamentMatchRepository
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class JdbcTournamentMatchRepository(private val jdbcClient: JdbcClient) : TournamentMatchRepository {

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
        // Sets match as played (1) and not playing (0) and removes from table
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
        // Sets match as not played (0), not playing (0) and removes from table
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
}
