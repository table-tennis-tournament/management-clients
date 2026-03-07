package de.ttt.management.tournament.domain

import java.time.LocalDateTime

interface TournamentMatchRepository {
    fun isMatchPlaying(matchId: Long): Boolean
    fun startMatch(matchId: Long, tableId: Long, startTime: LocalDateTime): Int
    fun stopMatch(matchId: Long): Int
    fun freeMatch(matchId: Long): Int
    fun takeBackMatch(matchId: Long): Int
}
