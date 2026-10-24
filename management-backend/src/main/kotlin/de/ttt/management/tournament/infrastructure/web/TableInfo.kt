package de.ttt.management.tournament.infrastructure.web

import de.ttt.management.tournament.domain.TournamentMatch

/**
 * Read model for a table with the matches currently assigned to it, matching the legacy
 * `/api/table/all` shape consumed by the admin client.
 */
data class TableInfo(
    val id: Long?,
    val number: Int?,
    val isLocked: Boolean,
    val matches: List<TournamentMatch>
)
