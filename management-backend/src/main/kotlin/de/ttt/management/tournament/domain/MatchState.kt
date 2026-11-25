package de.ttt.management.tournament.domain

/**
 * The lifecycle of a tournament match.
 *
 * [Open]       the match exists but is neither queued nor being played.
 * [InQueue]    the match is in the waiting list (Queue/MatchList).
 * [OnTable]    the match is assigned to a table (or, for a group, to two tables) but has not started.
 * [Started]    the match is being played.
 * [Completed]  a result has been entered and the match is finished.
 * [Finished]   the match has been played and left its table; its result is entered later ("Frei").
 * [Walkover]   the match ends without being played: a bye or a walkover ("kampflos").
 */
enum class MatchState {
    Open,
    InQueue,
    OnTable,
    Started,
    Completed,
    Finished,
    Walkover
}
