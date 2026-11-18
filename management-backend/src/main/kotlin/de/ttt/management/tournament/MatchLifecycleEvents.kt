package de.ttt.management.tournament

/**
 * Published when a match is assigned to a table (but not yet started).
 * [previousTableId] is the table the match was on before, if it was moved.
 */
data class MatchAssigned(
    val matchId: Long,
    val tableId: Long,
    val typeId: Long? = null,
    val previousTableId: Long? = null,
    /** Disciplines of other open matches of the same players, whose `isPlayable` this event changes. */
    val affectedTypeIds: List<Long> = emptyList()
)

/**
 * Published when a match is started on a table.
 * [previousTableId] is the table the match was on before, if it was moved.
 */
data class MatchStarted(
    val matchId: Long,
    val tableId: Long,
    val typeId: Long? = null,
    val previousTableId: Long? = null,
    /** Disciplines of other open matches of the same players, whose `isPlayable` this event changes. */
    val affectedTypeIds: List<Long> = emptyList()
)

/**
 * Published once per bulk operation when matches are freed (walkover / finished without a
 * played result). [typeIds] and [tableIds] are the disciplines and the tables the matches
 * were on before the operation.
 */
data class MatchFreed(
    val matchIds: List<Long>,
    val typeIds: List<Long> = emptyList(),
    val tableIds: List<Long> = emptyList(),
    /** Disciplines of other open matches of the same players, whose `isPlayable` this event changes. */
    val affectedTypeIds: List<Long> = emptyList()
)

/**
 * Published once per operation when matches are taken back from their table to the open
 * state, either by an administrator or by a table manager. [tableIds] are the tables the
 * matches were on before the operation.
 */
data class MatchTakenBack(
    val matchIds: List<Long>,
    val typeIds: List<Long> = emptyList(),
    val tableIds: List<Long> = emptyList(),
    /** Disciplines of other open matches of the same players, whose `isPlayable` this event changes. */
    val affectedTypeIds: List<Long> = emptyList()
)

/**
 * Published when matches are deleted, either single matches or all matches of a discipline.
 */
data class MatchDeleted(
    val matchIds: List<Long> = emptyList(),
    val typeIds: List<Long> = emptyList(),
    val tableIds: List<Long> = emptyList(),
    /** Disciplines of other open matches of the same players, whose `isPlayable` this event changes. */
    val affectedTypeIds: List<Long> = emptyList()
)
