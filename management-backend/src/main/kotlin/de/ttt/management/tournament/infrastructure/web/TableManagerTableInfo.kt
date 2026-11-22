// snake_case property names are the JSON contract with tablemanager-view (its models use the same names)
@file:Suppress("PropertyName")

package de.ttt.management.tournament.infrastructure.web

import java.time.OffsetDateTime

data class TableManagerTableInfo(
    val table_id: Long?,
    val table_number: Long?,
    val table_manager_id: Long,
    val matches: List<TableManagerMatch>
)

data class TableManagerMatch(
    val match_id: Long?,
    val result: TableManagerResult,
    val players_a: List<TableManagerPlayer>,
    val players_b: List<TableManagerPlayer>,
    val stage: String?,
    val classification: String?,
    /** The [de.ttt.management.tournament.domain.MatchState] name, as on every other Match DTO. */
    val state: String,
    /** See [de.ttt.management.tournament.domain.TournamentMatch.callNumber]. */
    val callNumber: Int,
    /** See [de.ttt.management.tournament.domain.TournamentMatch.requestedCallNumber]. */
    val requestedCallNumber: Int?,
    /** When the first Call was announced; the table manager shows the minutes since. */
    val firstCallTime: OffsetDateTime?
)

data class TableManagerResult(
    val games: List<TableManagerGame>,
    val games_won_player_a: Int,
    val games_won_player_b: Int
)

data class TableManagerGame(
    val score_player_a: Int,
    val score_player_b: Int
)

data class TableManagerPlayer(
    val player_id: Long?,
    val first_name: String?,
    val last_name: String?,
    val club: String?,
    /** How often this player has been called: 0 before the first Call, then 1 to 3. */
    val call_count: Int,
    /** The player's next call is requested and waits for the caller. */
    val call_requested: Boolean
)
