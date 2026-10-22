package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.*
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.time.LocalDateTime
import java.util.*

@Repository
class JdbcTournamentMatchRepository(private val jdbcClient: JdbcClient) : TournamentMatchRepository {

    private val rowMapper = RowMapper { rs, _ -> toMatch(rs) }

    private fun toMatch(rs: java.sql.ResultSet): TournamentMatch {
        val p1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() }
        val p2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() }
        val wId = rs.getObject("matc_winner_id")?.let { (it as Number).toLong() }
        val pgId = rs.getObject("matc_grou_id")?.let { (it as Number).toLong() }
        val mtId = rs.getObject("matc_maty_id")?.let { (it as Number).toLong() }

        return TournamentMatch(
            id = rs.getLong("matc_id"),
            players1 = p1Id?.let { listOf(TournamentPlayer(id = it)) } ?: emptyList(),
            players2 = p2Id?.let { listOf(TournamentPlayer(id = it)) } ?: emptyList(),
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
            isKampflos = rs.getInt("matc_kampflos") > 0,
            waitingList = rs.getBoolean("matc_waitinglist"),
            callState = CallState.fromCode(rs.getInt("matc_callstate")),
            tableId = rs.getObject("matc_tabl_id")?.let { (it as Number).toLong() },
            typeId = rs.getObject("matc_type_id")?.let { (it as Number).toLong() },
            nr = rs.getInt("matc_nr"),
            roundNumber = rs.getInt("matc_roundnumber"),
            startTime = rs.getTimestamp("matc_starttime")?.toLocalDateTime()
        )
    }

    /**
     * Resolves raw side ids (singles player ids or doubles team ids `>= 100000`) to the
     * individual players per side, optionally enriching them with names and TTR.
     */
    private fun resolvePlayers(matches: List<TournamentMatch>, withNames: Boolean): List<TournamentMatch> {
        val rawIds = matches.flatMap { (it.players1 + it.players2).mapNotNull { p -> p.id } }.distinct()
        if (rawIds.isEmpty()) return matches

        val playerIds = rawIds.filter { it < 100000 }
        val teamIds = rawIds.filter { it >= 100000 }.map { it - 100000 }

        val doubles: Map<Long, List<Long>> = if (teamIds.isEmpty()) emptyMap() else
            jdbcClient.sql("SELECT doub_id, doub_play1_id, doub_play2_id FROM doubles WHERE doub_id IN (:ids)")
                .param("ids", teamIds)
                .query { rs, _ -> rs.getLong("doub_id") to listOf(rs.getLong("doub_play1_id"), rs.getLong("doub_play2_id")) }
                .list().toMap()

        val allPlayerIds = (playerIds + doubles.values.flatten()).distinct()
        val players: Map<Long, TournamentPlayer> = if (!withNames || allPlayerIds.isEmpty()) emptyMap() else
            jdbcClient.sql("SELECT play_id, play_firstname, play_lastname, play_ttr FROM player WHERE play_id IN (:ids)")
                .param("ids", allPlayerIds)
                .query { rs, _ ->
                    rs.getLong("play_id") to TournamentPlayer(
                        id = rs.getLong("play_id"),
                        firstName = rs.getString("play_firstname"),
                        lastName = rs.getString("play_lastname"),
                        ttr = rs.getObject("play_ttr")?.let { (it as Number).toInt() }
                    )
                }
                .list().toMap()

        return matches.map { m ->
            m.apply {
                players1 = resolveSide(m.players1, doubles, players)
                players2 = resolveSide(m.players2, doubles, players)
            }
        }
    }

    private fun resolveSide(
        side: List<TournamentPlayer>,
        doubles: Map<Long, List<Long>>,
        players: Map<Long, TournamentPlayer>
    ): List<TournamentPlayer> = side.flatMap { p ->
        val raw = p.id ?: return@flatMap emptyList<TournamentPlayer>()
        if (raw >= 100000) {
            (doubles[raw - 100000] ?: emptyList()).map { pid -> players[pid] ?: TournamentPlayer(id = pid) }
        } else {
            listOf(players[raw] ?: p)
        }
    }

    private fun selectMatches(sql: String): String =
        "SELECT m.*, COALESCE(cs.call_state, 0) AS matc_callstate FROM matches m " +
            "LEFT JOIN mgmt_match_call_state cs ON cs.matc_id = m.matc_id $sql"

    override fun findAll(): List<TournamentMatch> {
        return resolvePlayers(jdbcClient.sql(selectMatches("")).query(rowMapper).list(), withNames = false)
    }

    override fun findById(id: Long): Optional<TournamentMatch> {
        return jdbcClient.sql(selectMatches("WHERE m.matc_id = :id")).param("id", id).query(rowMapper).optional()
    }

    override fun findByTypeId(typeId: Long): List<TournamentMatch> {
        return jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId"))
            .param("typeId", typeId).query(rowMapper).list()
    }

    override fun findOpen(): List<TournamentMatch> {
        return jdbcClient.sql(selectMatches("WHERE m.matc_played = 0")).query(rowMapper).list()
    }

    override fun findOpenByTypeId(typeId: Long): List<TournamentMatch> {
        return jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId AND m.matc_played = 0"))
            .param("typeId", typeId).query(rowMapper).list()
    }

    override fun findPlayed(): List<TournamentMatch> {
        return jdbcClient.sql(selectMatches("WHERE m.matc_played = 1")).query(rowMapper).list()
    }

    override fun findPlayedByTypeId(typeId: Long): List<TournamentMatch> {
        return jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId AND m.matc_played = 1"))
            .param("typeId", typeId).query(rowMapper).list()
    }

    override fun findByCallState(callState: CallState): List<TournamentMatch> {
        val raw = jdbcClient.sql(
            """
            SELECT m.*, 
                   mt.maty_name AS match_type_name,
                   g.grou_name AS group_name,
                   COALESCE(cs.call_state, 0) AS matc_callstate
            FROM matches m
            LEFT JOIN matchtype mt ON mt.maty_id = m.matc_maty_id
            LEFT JOIN `groups` g ON g.grou_id = m.matc_grou_id
            LEFT JOIN mgmt_match_call_state cs ON cs.matc_id = m.matc_id
            WHERE COALESCE(cs.call_state, 0) = :callState
              AND m.matc_tabl_id IS NOT NULL
            ORDER BY m.matc_tabl_id, m.matc_id
            """.trimIndent()
        )
            .param("callState", callState.code)
            .query { rs, _ ->
                toMatch(rs).apply {
                    rs.getObject("matc_maty_id")?.let { (it as Number).toLong() }?.let { mtId ->
                        matchType = TournamentMatchType(id = mtId, name = rs.getString("match_type_name"))
                    }
                    rs.getObject("matc_grou_id")?.let { (it as Number).toLong() }?.let { gId ->
                        playGroup = TournamentPlayGroup(id = gId, name = rs.getString("group_name"))
                    }
                }
            }
            .list()

        return resolvePlayers(raw, withNames = true)
    }

    override fun findByTableIds(tableIds: Collection<Long>): List<TournamentMatch> {
        if (tableIds.isEmpty()) return emptyList()
        val raw = jdbcClient.sql(
            """
            SELECT m.*, 
                   mt.maty_name AS match_type_name,
                   COALESCE(cs.call_state, 0) AS matc_callstate
            FROM matches m
            LEFT JOIN matchtype mt ON mt.maty_id = m.matc_maty_id
            LEFT JOIN mgmt_match_call_state cs ON cs.matc_id = m.matc_id
            WHERE m.matc_tabl_id IN (:tableIds)
            ORDER BY m.matc_tabl_id, m.matc_id
            """.trimIndent()
        )
            .param("tableIds", tableIds)
            .query { rs, _ ->
                toMatch(rs).apply {
                    rs.getObject("matc_maty_id")?.let { (it as Number).toLong() }?.let { mtId ->
                        matchType = TournamentMatchType(id = mtId, name = rs.getString("match_type_name"))
                    }
                }
            }
            .list()

        return resolvePlayers(raw, withNames = true)
    }

    override fun findTableIdsInUse(): Set<Long> {
        return jdbcClient.sql("SELECT DISTINCT matc_tabl_id FROM matches WHERE matc_tabl_id IS NOT NULL")
            .query { rs, _ -> rs.getLong("matc_tabl_id") }
            .set()
            .toSet()
    }

    override fun isMatchPlaying(matchId: Long): Boolean {
        val result = jdbcClient.sql("SELECT matc_isplaying FROM matches WHERE matc_id = :id")
            .param("id", matchId)
            .query(Int::class.java)
            .optional()

        return result.orElse(0) > 0
    }

    override fun assignMatch(matchId: Long, tableId: Long, startTime: LocalDateTime): Int {
        val updated = jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_tabl_id = :tableId, matc_isplaying = 0, matc_waitinglist = 0, matc_starttime = :startTime
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("tableId", tableId)
            .param("startTime", startTime)
            .param("id", matchId)
            .update()
        jdbcClient.sql("DELETE FROM mgmt_match_call_state WHERE matc_id = :id")
            .param("id", matchId)
            .update()
        return updated
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

    override fun removeFromTable(matchId: Long): Int {
        val updated = jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_tabl_id = NULL, matc_isplaying = 0
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("id", matchId)
            .update()
        jdbcClient.sql("DELETE FROM mgmt_match_call_state WHERE matc_id = :id")
            .param("id", matchId)
            .update()
        return updated
    }

    override fun freeMatch(matchId: Long): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_isplaying = 0, matc_played = 1, matc_kampflos = 1, matc_tabl_id = NULL
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
            SET matc_isplaying = 0, matc_played = 0, matc_kampflos = 0, matc_tabl_id = NULL
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("id", matchId)
            .update()
    }

    override fun setWaitingList(matchId: Long, waiting: Boolean): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_waitinglist = :waiting
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("waiting", if (waiting) 1 else 0)
            .param("id", matchId)
            .update()
    }

    override fun updateCallState(matchId: Long, callState: CallState): Int {
        return jdbcClient.sql(
            """
            INSERT INTO mgmt_match_call_state (matc_id, call_state) VALUES (:id, :callState)
            ON DUPLICATE KEY UPDATE call_state = :callState
            """.trimIndent()
        )
            .param("callState", callState.code)
            .param("id", matchId)
            .update()
    }

    override fun updatePartialResult(matchId: Long, resultRaw: String, result: String, sets1: Int, sets2: Int, balls1: Int, balls2: Int): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_resultraw = :resultRaw, matc_result = :result, matc_sets1 = :sets1, matc_sets2 = :sets2,
                matc_balls1 = :balls1, matc_balls2 = :balls2, matc_isplaying = 1, matc_played = 0
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("resultRaw", resultRaw)
            .param("result", result)
            .param("sets1", sets1)
            .param("sets2", sets2)
            .param("balls1", balls1)
            .param("balls2", balls2)
            .param("id", matchId)
            .update()
    }

    override fun completeResult(matchId: Long, resultRaw: String, result: String, sets1: Int, sets2: Int, balls1: Int, balls2: Int, winnerId: Long?): Int {
        return jdbcClient.sql(
            """
            UPDATE matches 
            SET matc_resultraw = :resultRaw, matc_result = :result, matc_sets1 = :sets1, matc_sets2 = :sets2,
                matc_balls1 = :balls1, matc_balls2 = :balls2, matc_winner_id = :winnerId,
                matc_played = 1, matc_isplaying = 0, matc_tabl_id = NULL
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("resultRaw", resultRaw)
            .param("result", result)
            .param("sets1", sets1)
            .param("sets2", sets2)
            .param("balls1", balls1)
            .param("balls2", balls2)
            .param("winnerId", winnerId)
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
