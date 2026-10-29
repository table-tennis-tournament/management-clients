package de.ttt.management.tournament

/**
 * Published when a table is locked or unlocked.
 */
data class TableLockChanged(
    val tableId: Long,
    val locked: Boolean
)
