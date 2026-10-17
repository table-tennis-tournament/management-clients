package de.ttt.management.tournament.infrastructure.web

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
    val state: String?
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
    val call_count: Int
)
