package de.ttt.management.outbound.infrastructure.database

import de.ttt.management.outbound.domain.*
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.time.format.DateTimeFormatter

@Repository
class JdbcLegacyReadRepository(private val jdbcClient: JdbcClient) : LegacyReadRepository {

    private val timeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")

    private data class MatchRow(
        val id: Long,
        val startTime: String?,
        val resultRaw: String?,
        val player1Id: Long?,
        val player2Id: Long?,
        val matchTypeId: Long?,
        val matchTypeName: String?,
        val typeId: Long?,
        val typeName: String?,
        val typeKind: Int,
        val typeActive: Boolean,
        val groupId: Long?,
        val groupName: String?,
        val isPlayed: Boolean,
        val isPlaying: Boolean,
        val isKampflos: Boolean,
        val waitingList: Boolean,
        val callState: Int,
        val tableId: Long?,
        val tableNumber: Int?
    )

    private data class PlayerData(
        val id: Long,
        val firstName: String?,
        val lastName: String?,
        val ttr: Int?,
        val sex: String?,
        val clubId: Long?,
        val clubName: String?
    )

    override fun fetchAllMatches(): List<LegacyMatchInfo> {
        val rows = loadMatchRows()
        if (rows.isEmpty()) return emptyList()

        val rawIds = rows.flatMap { listOfNotNull(it.player1Id, it.player2Id) }.distinct()
        val doubles = loadDoubles(rawIds.filter { it >= 100000 })
        val playerIds = rawIds.flatMap { resolveRawId(it, doubles) }.distinct()
        val players = loadPlayers(playerIds)

        val activePlayerIds = rows.filter { !it.isPlayed }
            .flatMap { listOfNotNull(it.player1Id, it.player2Id) }
            .flatMap { resolveRawId(it, doubles) }
            .toSet()

        return rows.map { toLegacyMatch(it, doubles, players, activePlayerIds) }
    }

    override fun fetchAllTables(): List<LegacyTableInfo> {
        val tables = jdbcClient.sql("SELECT tabl_id, tabl_name, tabl_locked FROM tables")
            .query { rs, _ ->
                Triple(rs.getLong("tabl_id"), rs.getString("tabl_name")?.toIntOrNull() ?: 0, rs.getInt("tabl_locked") > 0)
            }
            .list()
        val matches = fetchAllMatches()
        return tables.map { (id, number, locked) ->
            LegacyTableInfo(
                id = id,
                number = number,
                isLocked = locked,
                matches = matches.filter { it.table.contains(number) }
            )
        }
    }

    override fun fetchMatchList(): List<LegacyMatchListInfo> {
        val entries = jdbcClient.sql("SELECT uuid, match_ids, as_group, position FROM match_list ORDER BY position")
            .query { rs, _ ->
                LegacyMatchListItem(
                    id = rs.getString("uuid"),
                    matchIds = parseIds(rs.getString("match_ids")),
                    position = rs.getInt("position"),
                    group = rs.getObject("as_group")?.let { (it as Number).toLong() }
                )
            }
            .list()
        val matches = fetchAllMatches().associateBy { it.id }
        return entries.map { e -> LegacyMatchListInfo(e, e.matchIds.mapNotNull { matches[it] }) }
    }

    override fun fetchTableManagerTables(): List<LegacyTableManagerTableInfo> {
        val matches = fetchAllMatches()
        return TABLE_MANAGER_TABLES.flatMap { (managerId, tableNumbers) ->
            tableNumbers.map { number ->
                val tableMatches = matches.filter { it.table.contains(number) }.map { toTableManagerMatch(it) }
                LegacyTableManagerTableInfo(
                    table_id = tableIdForNumber(number) ?: 0L,
                    table_number = number.toLong(),
                    table_manager_id = managerId,
                    matches = tableMatches
                )
            }
        }
    }

    private fun loadMatchRows(): List<MatchRow> {
        return jdbcClient.sql(
            """
            SELECT m.matc_id, m.matc_starttime, m.matc_resultraw, m.matc_play1_id, m.matc_play2_id,
                   m.matc_maty_id, mt.maty_name,
                   m.matc_type_id, t.type_name, t.type_kind, t.type_active,
                   m.matc_grou_id, g.grou_name,
                   m.matc_played, m.matc_isplaying, m.matc_kampflos, m.matc_waitinglist, m.matc_callstate,
                   m.matc_tabl_id, tb.tabl_name
            FROM matches m
            LEFT JOIN matchtype mt ON mt.maty_id = m.matc_maty_id
            LEFT JOIN type t ON t.type_id = m.matc_type_id
            LEFT JOIN `groups` g ON g.grou_id = m.matc_grou_id
            LEFT JOIN tables tb ON tb.tabl_id = m.matc_tabl_id
            ORDER BY m.matc_id
            """.trimIndent()
        )
            .query { rs, _ ->
                MatchRow(
                    id = rs.getLong("matc_id"),
                    startTime = rs.getTimestamp("matc_starttime")?.toLocalDateTime()?.format(timeFormatter),
                    resultRaw = rs.getString("matc_resultraw"),
                    player1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() },
                    player2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() },
                    matchTypeId = rs.getObject("matc_maty_id")?.let { (it as Number).toLong() },
                    matchTypeName = rs.getString("maty_name"),
                    typeId = rs.getObject("matc_type_id")?.let { (it as Number).toLong() },
                    typeName = rs.getString("type_name"),
                    typeKind = rs.getInt("type_kind"),
                    typeActive = rs.getInt("type_active") > 0,
                    groupId = rs.getObject("matc_grou_id")?.let { (it as Number).toLong() },
                    groupName = rs.getString("grou_name"),
                    isPlayed = rs.getBoolean("matc_played"),
                    isPlaying = rs.getBoolean("matc_isplaying"),
                    isKampflos = rs.getInt("matc_kampflos") > 0,
                    waitingList = rs.getBoolean("matc_waitinglist"),
                    callState = rs.getInt("matc_callstate"),
                    tableId = rs.getObject("matc_tabl_id")?.let { (it as Number).toLong() },
                    tableNumber = rs.getString("tabl_name")?.toIntOrNull()
                )
            }
            .list()
    }

    private fun loadDoubles(teamIds: List<Long>): Map<Long, List<Long>> {
        if (teamIds.isEmpty()) return emptyMap()
        return jdbcClient.sql("SELECT doub_id, doub_play1_id, doub_play2_id FROM doubles WHERE doub_id IN (:ids)")
            .param("ids", teamIds.map { it - 100000 })
            .query { rs, _ -> rs.getLong("doub_id") to listOf(rs.getLong("doub_play1_id"), rs.getLong("doub_play2_id")) }
            .list()
            .toMap()
    }

    private fun resolveRawId(rawId: Long?, doubles: Map<Long, List<Long>>): List<Long> {
        if (rawId == null || rawId == 0L) return emptyList()
        return if (rawId >= 100000) doubles[rawId - 100000] ?: emptyList() else listOf(rawId)
    }

    private fun loadPlayers(ids: List<Long>): Map<Long, PlayerData> {
        if (ids.isEmpty()) return emptyMap()
        return jdbcClient.sql(
            """
            SELECT p.play_id, p.play_firstname, p.play_lastname, p.play_ttr, p.play_sex, p.play_club_id, c.club_name
            FROM player p
            LEFT JOIN club c ON c.club_id = p.play_club_id
            WHERE p.play_id IN (:ids)
            """.trimIndent()
        )
            .param("ids", ids)
            .query { rs, _ ->
                rs.getLong("play_id") to PlayerData(
                    id = rs.getLong("play_id"),
                    firstName = rs.getString("play_firstname"),
                    lastName = rs.getString("play_lastname"),
                    ttr = rs.getObject("play_ttr")?.let { (it as Number).toInt() },
                    sex = rs.getString("play_sex"),
                    clubId = rs.getObject("play_club_id")?.let { (it as Number).toLong() },
                    clubName = rs.getString("club_name")
                )
            }
            .list()
            .toMap()
    }

    private fun toLegacyMatch(
        row: MatchRow,
        doubles: Map<Long, List<Long>>,
        players: Map<Long, PlayerData>,
        activePlayerIds: Set<Long>
    ): LegacyMatchInfo {
        return LegacyMatchInfo(
            id = row.id,
            startTime = row.startTime,
            result = parseResultRaw(row.resultRaw),
            team1 = resolveRawId(row.player1Id, doubles).mapNotNull { id -> toLegacyPlayer(players[id], activePlayerIds) },
            team2 = resolveRawId(row.player2Id, doubles).mapNotNull { id -> toLegacyPlayer(players[id], activePlayerIds) },
            matchType = row.matchTypeId?.let { LegacyMatchType(it, row.matchTypeName) },
            type = row.typeId?.let { LegacyType(it, row.typeName, row.typeKind, row.typeActive) },
            group = row.groupId?.let { LegacyGroup(it, row.groupName) },
            isPlayable = row.player1Id != null && row.player2Id != null && row.player1Id != 0L && row.player2Id != 0L,
            state = legacyState(row),
            table = listOfNotNull(row.tableNumber)
        )
    }

    private fun toLegacyPlayer(data: PlayerData?, activePlayerIds: Set<Long>): LegacyPlayer? {
        data ?: return null
        return LegacyPlayer(
            id = data.id,
            firstName = data.firstName,
            lastName = data.lastName,
            ttr = data.ttr,
            sex = data.sex,
            club = data.clubId?.let { LegacyClub(it, data.clubName) },
            hasMatches = data.id in activePlayerIds,
            types = emptyList()
        )
    }

    private fun toTableManagerMatch(match: LegacyMatchInfo): LegacyTableManagerMatch {
        val games = match.result.orEmpty().map { LegacyTableManagerGame(it.getOrElse(0) { 0 }, it.getOrElse(1) { 0 }) }
        return LegacyTableManagerMatch(
            match_id = match.id,
            result = LegacyTableManagerResult(
                games = games,
                games_won_player_a = games.count { it.score_player_a > it.score_player_b },
                games_won_player_b = games.count { it.score_player_b > it.score_player_a }
            ),
            players_a = match.team1.map { toTableManagerPlayer(it) },
            players_b = match.team2.map { toTableManagerPlayer(it) },
            stage = match.matchType?.name,
            classification = match.type?.name,
            state = match.state
        )
    }

    private fun toTableManagerPlayer(player: LegacyPlayer): LegacyTableManagerPlayer =
        LegacyTableManagerPlayer(
            player_id = player.id,
            first_name = player.firstName,
            last_name = player.lastName,
            club = player.club?.clubName,
            call_count = 1
        )

    private fun legacyState(row: MatchRow): String = when {
        row.isPlayed && row.isKampflos -> "Finished"
        row.isPlayed -> "Completed"
        row.isPlaying -> "Started"
        row.callState == 3 -> "ThirdCall"
        row.callState == 2 -> "SecondCall"
        row.callState == 1 -> "OnTable"
        row.tableId != null -> "Callable"
        row.waitingList -> "InWaitingList"
        else -> "Open"
    }

    private fun tableIdForNumber(number: Int): Long? =
        jdbcClient.sql("SELECT tabl_id FROM tables WHERE tabl_name = :name")
            .param("name", number.toString())
            .query { rs, _ -> rs.getLong("tabl_id") }
            .optional()
            .orElse(null)

    private fun parseResultRaw(raw: String?): List<List<Int>>? {
        if (raw.isNullOrBlank()) return null
        return raw.split(",").map { pair ->
            val parts = pair.split("=")
            listOf(parts.getOrElse(0) { "0" }.trim().toIntOrNull() ?: 0, parts.getOrElse(1) { "0" }.trim().toIntOrNull() ?: 0)
        }
    }

    private fun parseIds(raw: String?): List<Long> =
        if (raw.isNullOrBlank()) emptyList() else raw.split(",").mapNotNull { it.trim().toLongOrNull() }

    companion object {
        /**
         * Duplicates the tournament module's manager→table-number mapping (modules don't share types).
         */
        val TABLE_MANAGER_TABLES: Map<Long, List<Int>> = mapOf(
            1L to listOf(1, 2, 3, 4, 5),
            2L to listOf(6, 7, 8, 11, 12),
            3L to listOf(9, 10, 13, 14, 15),
            4L to listOf(16, 17, 18, 19, 20),
            5L to listOf(21, 22, 23, 24)
        )
    }
}
