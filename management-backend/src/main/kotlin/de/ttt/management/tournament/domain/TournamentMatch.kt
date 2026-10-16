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

    /**
     * The per-set results, parsed from [resultRaw].
     */
    var sets: List<SetResult> = SetResult.fromResultRaw(resultRaw)

    val state: MatchState
        get() = when {
            isPlayed -> MatchState.Completed
            isPlaying -> MatchState.Started
            else -> MatchState.Open
        }

    /**
     * Starts the match, transitioning it to [MatchState.Started].
     */
    fun start() {
        require(!isPlayed) { "A completed match cannot be started" }
        require(!isPlaying) { "A match that is already playing cannot be started again" }
        isPlaying = true
    }

    /**
     * Frees the match (walkover), transitioning it to a terminal state.
     */
    fun free() {
        isPlayed = true
        isPlaying = false
        winner = null
    }

    /**
     * Takes a match back to [MatchState.Open] so it can be played again later.
     */
    fun takeBack() {
        isPlayed = false
        isPlaying = false
        winner = null
    }

    /**
     * Records an interim set result, putting the match into playing mode
     * without completing it.
     */
    fun enterResult(sets: List<SetResult>) {
        applySets(sets)
        this.isPlaying = true
        this.isPlayed = false
    }

    /**
     * Records the final result of the match and transitions it to [MatchState.Completed].
     * A match is won by the first side to reach three sets (best of five).
     */
    fun complete(sets: List<SetResult>) {
        val games1 = sets.count { it.pointsPlayer1 > it.pointsPlayer2 }
        val games2 = sets.count { it.pointsPlayer2 > it.pointsPlayer1 }
        require(games1 == 3 || games2 == 3) { "A match is won by the first side to reach three sets" }
        require(games1 != games2) { "The two sides cannot have an equal number of sets" }

        applySets(sets)
        this.isPlayed = true
        this.isPlaying = false
        this.winner = if (games1 > games2) player1 else player2
    }

    private fun applySets(sets: List<SetResult>) {
        this.sets = sets
        this.sets1 = sets.count { it.pointsPlayer1 > it.pointsPlayer2 }
        this.sets2 = sets.count { it.pointsPlayer2 > it.pointsPlayer1 }
        this.balls1 = sets.sumOf { it.pointsPlayer1 }
        this.balls2 = sets.sumOf { it.pointsPlayer2 }
        this.resultRaw = SetResult.toResultRaw(sets)
        this.result = "$sets1 : $sets2"
    }
}
