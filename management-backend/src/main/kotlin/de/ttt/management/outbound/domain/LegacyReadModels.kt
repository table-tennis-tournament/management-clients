package de.ttt.management.outbound.domain

/**
 * Read models mirroring the legacy backend's WebSocket payloads (v1).
 * Temporary: only used by the legacy raw-SockJS shim and removed on STOMP migration.
 */

data class LegacyClub(val id: Long?, val clubName: String?)

data class LegacyPlayer(
    val id: Long?,
    val firstName: String?,
    val lastName: String?,
    val ttr: Int?,
    val sex: String?,
    val club: LegacyClub?,
    val hasMatches: Boolean,
    val types: List<Long>
)

data class LegacyMatchType(val id: Long?, val name: String?)

data class LegacyType(val id: Long?, val name: String?, val kind: Int, val active: Boolean)

data class LegacyGroup(val id: Long?, val name: String?)

data class LegacyMatchInfo(
    val id: Long,
    val startTime: String?,
    val result: List<List<Int>>?,
    val team1: List<LegacyPlayer>,
    val team2: List<LegacyPlayer>,
    val matchType: LegacyMatchType?,
    val type: LegacyType?,
    val group: LegacyGroup?,
    val isPlayable: Boolean,
    val state: String,
    val table: List<Int>
)

data class LegacyTableInfo(
    val id: Long,
    val number: Int,
    val isLocked: Boolean,
    val matches: List<LegacyMatchInfo>
)

data class LegacyMatchListItem(
    val id: String?,
    val matchIds: List<Long>,
    val position: Int,
    val group: Long?
)

data class LegacyMatchListInfo(
    val matchListItem: LegacyMatchListItem,
    val matchinfo: List<LegacyMatchInfo>
)

data class LegacyTableManagerTableInfo(
    val table_id: Long,
    val table_number: Long,
    val table_manager_id: Long,
    val matches: List<LegacyTableManagerMatch>
)

data class LegacyTableManagerMatch(
    val match_id: Long,
    val result: LegacyTableManagerResult,
    val players_a: List<LegacyTableManagerPlayer>,
    val players_b: List<LegacyTableManagerPlayer>,
    val stage: String?,
    val classification: String?,
    val state: String
)

data class LegacyTableManagerResult(
    val games: List<LegacyTableManagerGame>,
    val games_won_player_a: Int,
    val games_won_player_b: Int
)

data class LegacyTableManagerGame(val score_player_a: Int, val score_player_b: Int)

data class LegacyTableManagerPlayer(
    val player_id: Long?,
    val first_name: String?,
    val last_name: String?,
    val club: String?,
    val call_count: Int
)
