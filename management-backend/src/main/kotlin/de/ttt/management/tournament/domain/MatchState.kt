package de.ttt.management.tournament.domain

/**
 * The lifecycle of a tournament match.
 *
 * [Open]       the match exists but is neither queued nor being played.
 * [InQueue]    the match is in the waiting list (Queue/MatchList).
 * [OnTable]    the match is assigned to a table but has not started.
 * [Started]    the match is being played.
 * [Completed]  a result has been entered and the match is finished.
 * [Finished]   the match ended without a played result (bye / walkover).
 */
enum class MatchState {
    Open,
    InQueue,
    OnTable,
    Started,
    Completed,
    Finished
}
