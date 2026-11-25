package de.ttt.management.registration

/**
 * Published when the short name of a discipline was set or removed.
 */
data class DisciplineShortNameChanged(
    val disciplineId: Long
)
