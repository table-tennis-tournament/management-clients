package de.ttt.management.tournament.domain
import java.time.LocalDateTime
class TournamentMatch(
    var id: Long? = null,
    var player1: TournamentPlayer? = null,
    var player2: TournamentPlayer? = null,
    var winner: TournamentPlayer? = null,
    var playGroup: TournamentPlayGroup? = null,
    var matchType: TournamentMatchType? = null,
    var result: String? = null,
    var resultRaw: String? = null,
    var sets1: Int? = null,
    var sets2: Int? = null,
    var balls1: Int? = null,
    var balls2: Int? = null,
    var isPlayed: Boolean = false,
    var isPlaying: Boolean = false,
    var nr: Int? = null,
    var roundNumber: Int? = null,
    var startTime: LocalDateTime? = null
)
