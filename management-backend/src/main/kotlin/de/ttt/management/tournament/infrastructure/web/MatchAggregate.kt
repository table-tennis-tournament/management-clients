package de.ttt.management.tournament.infrastructure.web

import java.time.LocalDateTime

/** The matches at one table the caller announces a Call for. */
data class MatchAggregate(
    val name: String?,
    val startTime: LocalDateTime?,
    /** The Call to announce: 1 for the first Call, 2 or 3 for a requested Second or Third call. */
    val callNumber: Int,
    /** When the first Call was announced; `null` before it. */
    val firstCallTime: LocalDateTime?,
    val tableNumbers: List<Long>,
    val discipline: DisciplineDto?,
    /** The players the Call names: all for the first Call, the missing ones for a Second or Third call. */
    val players: List<PlayerDto>,
    val matches: List<CallerMatchDto>
)

data class DisciplineDto(
    val id: Long?,
    val name: String?,
    val kind: Int,
    val active: Boolean
)

data class PlayerDto(
    val id: Long?,
    val firstName: String?,
    val lastName: String?,
    val ttr: Int?
)

data class CallerMatchDto(
    val id: Long,
    val startTime: LocalDateTime?,
    val team1: List<PlayerDto>,
    val team2: List<PlayerDto>
)
