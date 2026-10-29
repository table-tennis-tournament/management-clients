package de.ttt.management.registration

/**
 * Published when the colors of one or more disciplines were changed.
 */
data class DisciplineColorsChanged(
    val disciplineIds: List<Long>
)
