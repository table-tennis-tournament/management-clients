package de.ttt.management.tournament.infrastructure.web

import java.time.LocalDateTime

data class MatchAggregate(
    val name: String?,
    val startTime: LocalDateTime?,
    val tableNumbers: List<Long>,
    val discipline: DisciplineDto?,
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
