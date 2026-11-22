package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.*
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import org.springframework.util.IdGenerator
import java.time.Clock
import java.time.LocalDateTime
import java.util.*

@Repository
class JdbcTournamentMatchRepository(
    private val jdbcClient: JdbcClient,
    private val idGenerator: IdGenerator,
    private val clock: Clock,
    private val participationFacts: ParticipationFactsRepository
) : TournamentMatchRepository {

    private val rowMapper = RowMapper { rs, _ -> toMatch(rs) }

    private fun toMatch(rs: java.sql.ResultSet): TournamentMatch {
        val p1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() }?.takeIf { it > 0 }
        val p2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() }?.takeIf { it > 0 }
        val wId = rs.getObject("matc_winner_id")?.let { (it as Number).toLong() }?.takeIf { it > 0 }
        val mtId = rs.getObject("matc_maty_id")?.let { (it as Number).toLong() }?.takeIf { it > 0 }
        val pgId = rs.getObject("matc_grou_id")?.let { (it as Number).toLong() }?.takeIf { it > 0 }
        val groupName = rs.getString("group_name")

        return TournamentMatch(
            id = rs.getLong("matc_id"),
            team1 = p1Id?.let { listOf(TournamentPlayer(id = it)) } ?: emptyList(),
            team2 = p2Id?.let { listOf(TournamentPlayer(id = it)) } ?: emptyList(),
            side1Id = p1Id,
            side2Id = p2Id,
            winnerSideId = wId,
            playGroup = pgId?.takeIf { groupName != null }?.let { TournamentPlayGroup(id = it, name = groupName) },
            matchType = mtId?.let { TournamentMatchType(id = it, name = rs.getString("match_type_name")) },
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
            // stored as the local time of the clock's zone, like every time in the database
            firstCallTime = rs.getTimestamp("first_call_time")?.toLocalDateTime()?.atZone(clock.zone)?.toOffsetDateTime(),
            tableId = rs.getObject("matc_tabl_id")?.let { (it as Number).toLong() }?.takeIf { it > 0 },
            tableNumber = rs.getString("table_number")?.toIntOrNull(),
            secondTableId = rs.getObject("second_table_id")?.let { (it as Number).toLong() },
            secondTableNumber = rs.getString("second_table_number")?.toIntOrNull(),
            typeId = rs.getObject("matc_type_id")?.let { (it as Number).toLong() },
            groupId = pgId,
            type = rs.getObject("matc_type_id")?.let { (it as Number).toLong() }?.let { tid ->
                TournamentDiscipline.fromStored(
                    id = tid,
                    storedName = rs.getString("type_name"),
                    kind = rs.getInt("type_kind"),
                    active = rs.getInt("type_active") > 0
                )
            },
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
        val rawIds = matches.flatMap { (it.team1 + it.team2).mapNotNull { p -> p.id } }.distinct()
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
            jdbcClient.sql(
                "SELECT p.play_id, p.play_firstname, p.play_lastname, p.play_ttr, c.club_id, c.club_name " +
                    "FROM player p LEFT JOIN club c ON c.club_id = p.play_club_id WHERE p.play_id IN (:ids)"
            )
                .param("ids", allPlayerIds)
                .query { rs, _ ->
                    rs.getLong("play_id") to TournamentPlayer(
                        id = rs.getLong("play_id"),
                        firstName = rs.getString("play_firstname"),
                        lastName = rs.getString("play_lastname"),
                        ttr = rs.getObject("play_ttr")?.let { (it as Number).toInt() },
                        club = rs.getObject("club_id")?.let { TournamentClub((it as Number).toLong(), rs.getString("club_name")) }
                    )
                }
                .list().toMap()

        return matches.map { m ->
            m.apply {
                team1 = resolveSide(m.team1, doubles, players)
                team2 = resolveSide(m.team2, doubles, players)
            }
        }
    }

    private fun resolveSide(
        side: List<TournamentPlayer>,
        doubles: Map<Long, List<Long>>,
        players: Map<Long, TournamentPlayer>
    ): List<TournamentPlayer> = side.flatMap { p ->
        val raw = p.id ?: return@flatMap emptyList()
        if (raw >= 100000) {
            (doubles[raw - 100000] ?: emptyList()).map { pid -> players[pid] ?: TournamentPlayer(id = pid) }
        } else {
            listOf(players[raw] ?: p)
        }
    }

    /** Loads the [TournamentMatch.playerCalls] of the matches from `mgmt_player_call`. */
    private fun withCalls(matches: List<TournamentMatch>): List<TournamentMatch> {
        val ids = matches.mapNotNull { it.id }
        if (ids.isEmpty()) return matches
        val calls = jdbcClient.sql("SELECT matc_id, play_id, call_number, requested FROM mgmt_player_call WHERE matc_id IN (:ids) ORDER BY play_id")
            .param("ids", ids)
            .query { rs, _ -> rs.getLong("matc_id") to PlayerCall(rs.getLong("play_id"), rs.getInt("call_number"), rs.getInt("requested") > 0) }
            .list()
            .groupBy({ it.first }, { it.second })
        matches.forEach { m -> m.playerCalls = calls[m.id] ?: emptyList() }
        return matches
    }

    /** Adds the calls, [TournamentMatch.isPlayable] and the disciplines each player is still in. */
    private fun withPlayersInfo(matches: List<TournamentMatch>): List<TournamentMatch> =
        withDisciplines(withPlayability(matches))

    /** Sets [TournamentPlayer.types] of every player of the matches, computed for the whole tournament. */
    private fun withDisciplines(matches: List<TournamentMatch>): List<TournamentMatch> {
        if (matches.isEmpty()) return matches
        val typesByPlayer = DisciplineParticipation.typeIdsByPlayer(participationFacts.load())
        matches.flatMap { it.team1 + it.team2 }.forEach { player ->
            player.types = player.id?.let { typesByPlayer[it] }.orEmpty()
        }
        return matches
    }

    /**
     * Loads the calls and sets [TournamentMatch.isPlayable] against every blocking match of the tournament, not
     * only the loaded ones: a player on a table in one discipline blocks their matches in all others.
     */
    private fun withPlayability(matches: List<TournamentMatch>): List<TournamentMatch> {
        withCalls(matches)
        val blockingIds = blockingPlayerIds()
        matches.forEach { m ->
            val ids = (m.team1 + m.team2).mapNotNull { it.id }.toSet()
            m.isPlayable = m.team1.isNotEmpty() && m.team2.isNotEmpty() && ids.none { it in blockingIds }
        }
        return matches
    }

    /** The players of every match that is on a table. */
    private fun blockingPlayerIds(): Set<Long> =
        resolvePlayers(
            jdbcClient.sql(selectMatches("WHERE m.matc_tabl_id > 0")).query(rowMapper).list(),
            withNames = false
        ).flatMap { it.team1 + it.team2 }.mapNotNull { it.id }.toSet()

    private fun selectMatches(sql: String): String =
        "SELECT m.*, mc.first_call_time, mt.maty_name AS match_type_name, g.grou_name AS group_name, " +
            "ty.type_name AS type_name, ty.type_kind AS type_kind, ty.type_active AS type_active, tb.tabl_name AS table_number, " +
            "st.tableId AS second_table_id, tb2.tabl_name AS second_table_number " +
            "FROM matches m " +
            "LEFT JOIN mgmt_match_call mc ON mc.matc_id = m.matc_id " +
            "LEFT JOIN matchtype mt ON mt.maty_id = m.matc_maty_id " +
            "LEFT JOIN playgroups g ON g.grou_id = m.matc_grou_id " +
            "LEFT JOIN type ty ON ty.type_id = m.matc_type_id " +
            "LEFT JOIN tables tb ON tb.tabl_id = m.matc_tabl_id " +
            // a match is on at most two tables: the row of the other table is its second table
            "LEFT JOIN mgmt_matchtable st ON st.matchId = m.matc_id AND st.tableId <> m.matc_tabl_id " +
            "LEFT JOIN tables tb2 ON tb2.tabl_id = st.tableId $sql"

    override fun findAll(): List<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("")).query(rowMapper).list(), withNames = true))
    }

    override fun findById(id: Long): Optional<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("WHERE m.matc_id = :id")).param("id", id).query(rowMapper).list(), withNames = true))
            .firstOrNull()
            .let { Optional.ofNullable(it) }
    }

    override fun findByTypeId(typeId: Long): List<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId"))
            .param("typeId", typeId).query(rowMapper).list(), withNames = true))
    }

    override fun findOpen(): List<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("WHERE m.matc_played = 0")).query(rowMapper).list(), withNames = true))
    }

    override fun findOpenByTypeId(typeId: Long): List<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId AND m.matc_played = 0"))
            .param("typeId", typeId).query(rowMapper).list(), withNames = true))
    }

    override fun findPlayed(): List<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("WHERE m.matc_played = 1")).query(rowMapper).list(), withNames = true))
    }

    override fun findPlayedByTypeId(typeId: Long): List<TournamentMatch> {
        return withPlayersInfo(resolvePlayers(jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId AND m.matc_played = 1"))
            .param("typeId", typeId).query(rowMapper).list(), withNames = true))
    }

    override fun findWaitingForFirstCall(): List<TournamentMatch> =
        withPlayersInfo(resolvePlayers(
            jdbcClient.sql(
                selectMatches("WHERE mc.matc_id IS NULL AND m.matc_tabl_id > 0 AND m.matc_played = 0 ORDER BY m.matc_tabl_id, m.matc_id")
            ).query(rowMapper).list(),
            withNames = true
        ))

    override fun findWithRequestedCall(): List<TournamentMatch> =
        withPlayersInfo(resolvePlayers(
            jdbcClient.sql(
                selectMatches(
                    "WHERE m.matc_tabl_id > 0 AND m.matc_played = 0 " +
                        "AND EXISTS (SELECT 1 FROM mgmt_player_call pc WHERE pc.matc_id = m.matc_id AND pc.requested > 0) " +
                        "ORDER BY m.matc_tabl_id, m.matc_id"
                )
            ).query(rowMapper).list(),
            withNames = true
        ))

    override fun findByTableIds(tableIds: Collection<Long>): List<TournamentMatch> {
        if (tableIds.isEmpty()) return emptyList()
        return withPlayersInfo(resolvePlayers(
            jdbcClient.sql(
                selectMatches("WHERE m.matc_tabl_id IN (:tableIds) OR st.tableId IN (:tableIds) ORDER BY m.matc_tabl_id, m.matc_id")
            )
                .param("tableIds", tableIds)
                .query(rowMapper)
                .list(),
            withNames = true
        ))
    }

    override fun findOpenTypeIdsOfPlayers(playerIds: Collection<Long>, excludedMatchIds: Collection<Long>): Set<Long> {
        if (playerIds.isEmpty()) return emptySet()
        val doubleSides = jdbcClient.sql("SELECT doub_id FROM doubles WHERE doub_play1_id IN (:ids) OR doub_play2_id IN (:ids)")
            .param("ids", playerIds)
            .query { rs, _ -> 100000 + rs.getLong("doub_id") }
            .list()
        return jdbcClient.sql(
            """
            SELECT DISTINCT matc_type_id FROM matches
            WHERE matc_played = 0 AND matc_type_id IS NOT NULL AND matc_id NOT IN (:excluded)
              AND (matc_play1_id IN (:sides) OR matc_play2_id IN (:sides))
            """.trimIndent()
        )
            .param("excluded", excludedMatchIds.ifEmpty { listOf(-1L) })
            .param("sides", playerIds + doubleSides)
            .query { rs, _ -> rs.getLong("matc_type_id") }
            .set()
    }

    override fun findByTypeIdAndNr(typeId: Long, nr: Int): TournamentMatch? =
        withPlayersInfo(resolvePlayers(
            jdbcClient.sql(selectMatches("WHERE m.matc_type_id = :typeId AND m.matc_nr = :nr ORDER BY m.matc_id"))
                .param("typeId", typeId)
                .param("nr", nr)
                .query(rowMapper)
                .list(),
            withNames = true
        )).firstOrNull()

    override fun findTableIdsInUse(): Set<Long> {
        return jdbcClient.sql(
            "SELECT matc_tabl_id FROM matches WHERE matc_tabl_id > 0 UNION SELECT tableId FROM mgmt_matchtable"
        )
            .query { rs, _ -> rs.getLong("matc_tabl_id") }
            .set()
            .toSet()
    }

    /**
     * Writes only the lifecycle columns; players, discipline, number and round belong to mktt
     * (ADR-0001). The calls and the table history live in the `mgmt_` sidecar tables.
     */
    override fun save(match: TournamentMatch): Int {
        val id = requireNotNull(match.id) { "Only an existing match can be saved" }
        val updated = jdbcClient.sql(
            """
            UPDATE matches
            SET matc_tabl_id = :tableId, matc_isplaying = :playing, matc_played = :played,
                matc_kampflos = :kampflos, matc_waitinglist = :waiting, matc_starttime = :startTime,
                matc_winner_id = :winnerId, matc_result = :result, matc_resultraw = :resultRaw,
                matc_sets1 = :sets1, matc_sets2 = :sets2, matc_balls1 = :balls1, matc_balls2 = :balls2
            WHERE matc_id = :id
            """.trimIndent()
        )
            .param("tableId", match.tableId)
            .param("playing", if (match.isPlaying) 1 else 0)
            .param("played", if (match.isPlayed) 1 else 0)
            .param("kampflos", if (match.isKampflos) 1 else 0)
            .param("waiting", if (match.waitingList) 1 else 0)
            .param("startTime", match.startTime)
            .param("winnerId", match.winnerSideId)
            .param("result", match.result)
            .param("resultRaw", match.resultRaw)
            .param("sets1", match.sets1 ?: 0)
            .param("sets2", match.sets2 ?: 0)
            .param("balls1", match.balls1 ?: 0)
            .param("balls2", match.balls2 ?: 0)
            .param("id", id)
            .update()
        if (updated == 0) return 0

        saveCalls(id, match)
        syncMatchTables(id, listOfNotNull(match.tableId, match.secondTableId).toSet())
        return updated
    }

    /** Replaces the match's rows in `mgmt_match_call` and `mgmt_player_call`; no rows while it is not called. */
    private fun saveCalls(matchId: Long, match: TournamentMatch) {
        deleteCalls(matchId)
        match.firstCallTime?.let { time ->
            jdbcClient.sql("INSERT INTO mgmt_match_call (matc_id, first_call_time) VALUES (:id, :time)")
                .param("id", matchId)
                .param("time", time.atZoneSameInstant(clock.zone).toLocalDateTime())
                .update()
        }
        match.playerCalls.forEach { call ->
            jdbcClient.sql(
                "INSERT INTO mgmt_player_call (matc_id, play_id, call_number, requested) VALUES (:id, :playerId, :callNumber, :requested)"
            )
                .param("id", matchId)
                .param("playerId", call.playerId)
                .param("callNumber", call.callNumber)
                .param("requested", if (call.requested) 1 else 0)
                .update()
        }
    }

    private fun deleteCalls(matchId: Long) {
        jdbcClient.sql("DELETE FROM mgmt_match_call WHERE matc_id = :id").param("id", matchId).update()
        jdbcClient.sql("DELETE FROM mgmt_player_call WHERE matc_id = :id").param("id", matchId).update()
    }

    /** The Sides belong to mktt; only a winner moving on in the knockout stage writes them, as the legacy backend did. */
    override fun saveSides(match: TournamentMatch): Int {
        val id = requireNotNull(match.id) { "Only an existing match can be saved" }
        return jdbcClient.sql("UPDATE matches SET matc_play1_id = :side1, matc_play2_id = :side2 WHERE matc_id = :id")
            .param("side1", match.side1Id ?: 0)
            .param("side2", match.side2Id ?: 0)
            .param("id", id)
            .update()
    }

    override fun deleteById(id: Long): Int {
        deleteMatchTableForMatch(id)
        deleteCalls(id)
        return jdbcClient.sql("DELETE FROM matches WHERE matc_id = :id").param("id", id).update()
    }

    private fun insertMatchTable(matchId: Long, tableId: Long) {
        jdbcClient.sql(
            "INSERT INTO mgmt_matchtable (id, tableId, matchId, timestamp) VALUES (:id, :tableId, :matchId, :timestamp)"
        )
            .param("id", idGenerator.generateId().toString())
            .param("tableId", tableId)
            .param("matchId", matchId)
            .param("timestamp", LocalDateTime.now(clock))
            .update()
    }

    /** Keeps one `mgmt_matchtable` row per table the match is at; unchanged rows stay as they are. */
    private fun syncMatchTables(matchId: Long, tableIds: Set<Long>) {
        val stored = jdbcClient.sql("SELECT tableId FROM mgmt_matchtable WHERE matchId = :matchId")
            .param("matchId", matchId)
            .query { rs, _ -> rs.getLong("tableId") }
            .set()
        (stored - tableIds).forEach { tableId ->
            jdbcClient.sql("DELETE FROM mgmt_matchtable WHERE matchId = :matchId AND tableId = :tableId")
                .param("matchId", matchId)
                .param("tableId", tableId)
                .update()
        }
        (tableIds - stored).forEach { insertMatchTable(matchId, it) }
    }

    private fun deleteMatchTableForMatch(matchId: Long) {
        jdbcClient.sql("DELETE FROM mgmt_matchtable WHERE matchId = :matchId")
            .param("matchId", matchId)
            .update()
    }

    override fun deleteByTypeId(typeId: Long): Int {
        jdbcClient.sql("DELETE FROM mgmt_matchtable WHERE matchId IN (SELECT matc_id FROM matches WHERE matc_type_id = :typeId)")
            .param("typeId", typeId)
            .update()
        jdbcClient.sql("DELETE FROM mgmt_match_call WHERE matc_id IN (SELECT matc_id FROM matches WHERE matc_type_id = :typeId)")
            .param("typeId", typeId)
            .update()
        jdbcClient.sql("DELETE FROM mgmt_player_call WHERE matc_id IN (SELECT matc_id FROM matches WHERE matc_type_id = :typeId)")
            .param("typeId", typeId)
            .update()
        return jdbcClient.sql("DELETE FROM matches WHERE matc_type_id = :typeId").param("typeId", typeId).update()
    }
}
