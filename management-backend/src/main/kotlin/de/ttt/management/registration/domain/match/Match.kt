package de.ttt.management.registration.domain.match

import de.ttt.management.registration.domain.player.Player
import java.time.LocalDateTime

class Match(
    var id: Long? = null,
    var player1: Player? = null,
    var player2: Player? = null,
    var winner: Player? = null,
    var playGroup: PlayGroup? = null,
    var matchType: MatchType? = null,
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
