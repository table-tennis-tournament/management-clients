package de.ttt.management.tournament.domain
import java.time.LocalDateTime
class TournamentMatch(
    var id: Long? = null,
    var team1: List<TournamentPlayer> = emptyList(),
    var team2: List<TournamentPlayer> = emptyList(),
    /** The stored side ids (`matc_play1_id`, `matc_play2_id`): a player id, or `100000 + double id` for doubles. */
    var side1Id: Long? = null,
    var side2Id: Long? = null,
    /** The side id of the winning side, as mktt stores it in `matc_winner_id`. */
    var winnerSideId: Long? = null,
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
    /**
     * The number of the table [tableId] names, as stored (the venue's table number, not the id). Read only: a
     * transition that changes the table clears it, the number is known again once the match is reloaded.
     */
    var tableNumber: Int? = null,
    /**
     * The second table of a match whose group plays on two tables. The match waits at both tables and is
     * started at one of them, which takes it off the other.
     */
    var secondTableId: Long? = null,
    /** The number of [secondTableId], as stored; read only like [tableNumber]. */
    var secondTableNumber: Int? = null,
    var typeId: Long? = null,
    var type: TournamentDiscipline? = null,
    /** The stored group id (`matc_grou_id`); [KNOCKOUT_GROUP_ID] marks the knockout stage. */
    var groupId: Long? = null,
    var nr: Int? = null,
    var roundNumber: Int? = null,
    var startTime: LocalDateTime? = null
) {

    /**
     * The first player of side A, kept as a convenience for singles-centric callers.
     */
    val player1: TournamentPlayer?
        get() = team1.firstOrNull()

    /**
     * The first player of side B, kept as a convenience for singles-centric callers.
     */
    val player2: TournamentPlayer?
        get() = team2.firstOrNull()

    /** The players of the winning side; empty while the match has no winner. */
    val winner: List<TournamentPlayer>
        get() = when (winnerSideId) {
            null -> emptyList()
            sideId(1) -> team1
            sideId(2) -> team2
            else -> emptyList()
        }

    /** The stored id of side [side] (1 or 2); a singles side without a stored id is its player. */
    private fun sideId(side: Int): Long? =
        if (side == 1) side1Id ?: team1.singleOrNull()?.id else side2Id ?: team2.singleOrNull()?.id

    /**
     * The per-set results, parsed from [resultRaw].
     */
    var sets: List<SetResult> = SetResult.fromResultRaw(resultRaw)

    val state: MatchState
        get() = when {
            isPlayed && isKampflos -> MatchState.Walkover
            isPlayed && winnerSideId != null -> MatchState.Completed
            isPlayed -> MatchState.Finished
            isPlaying -> MatchState.Started
            tableId != null -> MatchState.OnTable
            waitingList -> MatchState.InQueue
            else -> MatchState.Open
        }

    /**
     * How many Calls have been announced for the match: 0 (none), 1, 2 (Second call) or 3
     * (Third call). Serialized next to [state] so clients never derive it themselves.
     */
    val callNumber: Int
        get() = callState.code

    /**
     * A match blocks other matches involving the same players when it is assigned to a table
     * or already being played.
     */
    val isBlocking: Boolean
        get() = tableId != null

    /**
     * Whether both sides are present and none of this match's players is currently
     * involved in a blocking match. Computed against the full match list and serialized
     * to the client as `isPlayable`.
     */
    var isPlayable: Boolean = false

    /**
     * A match is playable when both sides are present and none of its players is
     * currently involved in a blocking match.
     */
    fun isPlayableAgainst(allMatches: Collection<TournamentMatch>): Boolean {
        if (team1.isEmpty() || team2.isEmpty()) return false
        val ids = (team1 + team2).mapNotNull { it.id }.toSet()
        return allMatches.none { m ->
            m.isBlocking && (m.team1 + m.team2).any { it.id in ids }
        }
    }

    /**
     * Assigns the match to a table without starting it, transitioning it to [MatchState.OnTable].
     * Any previous call is cleared.
     */
    fun assign(tableId: Long, now: LocalDateTime) {
        require(!isPlayed) { "A completed match cannot be assigned" }
        require(!isPlaying) { "A match that is already playing cannot be reassigned" }
        if (tableId != this.tableId) tableNumber = null
        this.tableId = tableId
        startTime = now
        isPlaying = false
        waitingList = false
        callState = CallState.None
    }

    /**
     * Starts the match on [tableId] (by default the table it is assigned to),
     * transitioning it to [MatchState.Started].
     */
    fun start(tableId: Long? = this.tableId, now: LocalDateTime) {
        require(!isPlayed) { "A completed match cannot be started" }
        require(!isPlaying) { "A match that is already playing cannot be started again" }
        require(secondTableId == null || tableId == this.tableId || tableId == secondTableId) {
            "A match waiting at two tables is started at one of them"
        }
        if (tableId != null && tableId == secondTableId) {
            // started at its second table: it leaves the first one
            this.tableNumber = secondTableNumber
        } else if (tableId != this.tableId) {
            tableNumber = null
        }
        secondTableId = null
        secondTableNumber = null
        this.tableId = tableId
        startTime = now
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
     * The number of the knockout match this match's winner moves on to, or `null` for a group match and for
     * the final. mktt numbers a knockout match `round * 1000 + position`; the winners of positions `2n - 1` and
     * `2n` meet at position `n` of the round before (the legacy backend's `writeNextKoMatch`).
     */
    val nextKnockoutMatchNr: Int?
        get() {
            val nr = nr ?: return null
            if (groupId != KNOCKOUT_GROUP_ID || matchType?.id?.let { it in MOVES_WINNER_ON } != true) return null
            return ((nr / 1000) - 1) * 1000 + ((nr % 1000) + 1) / 2
        }

    /**
     * Puts the winner of the knockout match [previous] into its Side of this match: Side 1 for an odd
     * [previous] number, Side 2 for an even one. A Side that is already set is overwritten, as in the legacy
     * backend, so a corrected result moves the corrected winner on.
     */
    fun takeWinnerOf(previous: TournamentMatch) {
        require(previous.nextKnockoutMatchNr != null && previous.nextKnockoutMatchNr == nr) {
            "Only the winner of a knockout match that leads to this match moves on into it"
        }
        val winnerSideId = requireNotNull(previous.winnerSideId) { "Only a match with a winner moves its winner on" }
        if (requireNotNull(previous.nr) % 1000 % 2 == 1) {
            side1Id = winnerSideId
            team1 = previous.winner
        } else {
            side2Id = winnerSideId
            team2 = previous.winner
        }
    }

    /**
     * Puts a match that waits at a table on a second table as well, for a group that plays on two tables. The
     * match is started at one of them later.
     */
    fun assignSecondTable(tableId: Long) {
        require(state == MatchState.OnTable) { "Only a match waiting at a table can get a second table" }
        require(tableId != this.tableId) { "The second table must be another table" }
        secondTableId = tableId
        secondTableNumber = null
    }

    /**
     * Takes a match that waits at two tables off [tableId]; it keeps waiting at the other one ("Entfernen").
     */
    fun leaveOneTable(tableId: Long) {
        require(secondTableId != null) { "Only a match at two tables can leave one of them" }
        when (tableId) {
            secondTableId -> Unit
            this.tableId -> {
                this.tableId = secondTableId
                this.tableNumber = secondTableNumber
            }
            else -> throw IllegalArgumentException("The match is not at table $tableId")
        }
        secondTableId = null
        secondTableNumber = null
    }


    /**
     * The match is over at its table ("Frei"), its result is entered later: it leaves the table and waits for the
     * result in [MatchState.Finished]. Entering the result with [complete] makes it Completed.
     */
    fun free() {
        isPlayed = true
        isPlaying = false
        isKampflos = false
        winnerSideId = null
        leaveTable()
    }

    /**
     * Takes a match back from its table to [MatchState.Open] so it can be played again later.
     * Used for the administrator's take back and the table manager's "Zurück". The match is played
     * again from the start, so its result and start time are cleared.
     */
    fun takeBack() {
        isPlayed = false
        isPlaying = false
        isKampflos = false
        winnerSideId = null
        startTime = null
        clearResult()
        leaveTable()
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
     * Records the final result of the match and transitions it to [MatchState.Completed], or to
     * [MatchState.Walkover] when it was [kampflos]: a Side did not appear and the other wins with the entered
     * result. A match is won by the first side to reach three sets (best of five).
     */
    fun complete(sets: List<SetResult>, kampflos: Boolean = false) {
        val games1 = sets.count { it.pointsPlayer1 > it.pointsPlayer2 }
        val games2 = sets.count { it.pointsPlayer2 > it.pointsPlayer1 }
        require(games1 == 3 || games2 == 3) { "A match is won by the first side to reach three sets" }
        require(games1 != games2) { "The two sides cannot have an equal number of sets" }

        applySets(sets)
        this.isPlayed = true
        this.isPlaying = false
        this.isKampflos = kampflos
        this.winnerSideId = sideId(if (games1 > games2) 1 else 2)
        leaveTable()
    }

    private fun leaveTable() {
        tableId = null
        tableNumber = null
        secondTableId = null
        secondTableNumber = null
        callState = CallState.None
    }

    private fun clearResult() {
        sets = emptyList()
        sets1 = null
        sets2 = null
        balls1 = null
        balls2 = null
        resultRaw = null
        result = null
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

/** The group id mktt gives every knockout match. */
const val KNOCKOUT_GROUP_ID = 999L

/** The knockout match types whose winner moves on: Halbfinale (2) to Runde 0 (8); the final (1) ends the bracket. */
private val MOVES_WINNER_ON = 2L..8L
