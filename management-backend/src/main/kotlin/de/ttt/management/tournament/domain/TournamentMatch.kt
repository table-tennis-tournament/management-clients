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
) {

    val state: MatchState
        get() = when {
            isPlayed -> MatchState.Completed
            isPlaying -> MatchState.Started
            else -> MatchState.Open
        }

    /**
     * Records the final result of the match and transitions it to [MatchState.Completed].
     * A match is won by the first side to reach three sets (best of five).
     */
    fun complete(resultRaw: String, sets1: Int, sets2: Int) {
        require(sets1 == 3 || sets2 == 3) { "A match is won by the first side to reach three sets" }
        require(sets1 != sets2) { "The two sides cannot have an equal number of sets" }

        this.resultRaw = resultRaw
        this.sets1 = sets1
        this.sets2 = sets2
        this.isPlayed = true
        this.isPlaying = false
        this.winner = if (sets1 > sets2) player1 else player2
    }
}
