package de.ttt.management.settings.domain

/**
 * The data needed to render a referee sheet (Schirizettel) for a single match.
 * A lightweight, read-only projection owned by the settings module.
 */
data class MatchPrintInfo(
    val id: Long,
    val disciplineName: String?,
    val groupName: String?,
    val matchTypeName: String?,
    val roundNumber: Int?,
    val tableNumber: String?,
    val player1Names: List<String>,
    val player2Names: List<String>
)
