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
    var isKampflos: Boolean = false,
    var waitingList: Boolean = false,
    var callState: CallState = CallState.None,
    var tableId: Long? = null,
    var typeId: Long? = null,
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
            isPlayed && isKampflos -> MatchState.Finished
            isPlayed -> MatchState.Completed
            isPlaying -> MatchState.Started
            tableId != null -> MatchState.OnTable
            waitingList -> MatchState.InQueue
            else -> MatchState.Open
        }

    /**
     * A match blocks other matches involving the same players when it is assigned to a table
     * or already being played.
     */
    val isBlocking: Boolean
        get() = tableId != null

    /**
     * A match is playable when both sides are present and none of its players is
     * currently involved in a blocking match.
     */
    fun isPlayable(allMatches: Collection<TournamentMatch>): Boolean {
        val p1 = player1?.id ?: return false
        val p2 = player2?.id ?: return false
        return allMatches.none { m ->
            m.isBlocking && (m.player1?.id == p1 || m.player1?.id == p2 || m.player2?.id == p1 || m.player2?.id == p2)
        }
    }

    /**
     * Assigns the match to a table without starting it, transitioning it to [MatchState.OnTable].
     */
    fun assign(tableId: Long) {
        require(!isPlayed) { "A completed match cannot be assigned" }
        require(!isPlaying) { "A match that is already playing cannot be reassigned" }
        this.tableId = tableId
        isPlaying = false
        waitingList = false
        callState = CallState.None
    }

    /**
     * Starts the match, transitioning it to [MatchState.Started].
     */
    fun start() {
        require(!isPlayed) { "A completed match cannot be started" }
        require(!isPlaying) { "A match that is already playing cannot be started again" }
        isPlaying = true
        waitingList = false
    }

    /**
     * Places the match in the queue (MatchList), transitioning it to [MatchState.InQueue].
     */
    fun queue() {
        require(!isPlayed) { "A completed match cannot be queued" }
        require(!isPlaying) { "A match that is already playing cannot be queued" }
        waitingList = true
    }

    /**
     * Removes the match from the queue, returning it to [MatchState.Open].
     */
    fun dequeue() {
        waitingList = false
    }

    /**
     * Announces the first call for the match, transitioning it to [CallState.FirstCall].
     */
    fun call() {
        require(!isPlayed) { "A completed match cannot be called" }
        callState = CallState.FirstCall
    }

    /**
     * Announces the next call for the match (second or third), advancing [CallState.FirstCall]
     * to [CallState.SecondCall] and [CallState.SecondCall] to [CallState.ThirdCall].
     */
    fun callAgain() {
        callState = when (callState) {
            CallState.FirstCall -> CallState.SecondCall
            CallState.SecondCall -> CallState.ThirdCall
            else -> callState
        }
    }

    /**
     * Frees the match (walkover), transitioning it to [MatchState.Finished].
     */
    fun free() {
        isPlayed = true
        isPlaying = false
        isKampflos = true
        winner = null
    }

    /**
     * Takes a match back to [MatchState.Open] so it can be played again later.
     */
    fun takeBack() {
        isPlayed = false
        isPlaying = false
        isKampflos = false
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
        this.isKampflos = false
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
        this.isKampflos = false
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
