package de.ttt.management.tournament.domain
data class TournamentDiscipline(
    var id: Long? = null,
    var name: String? = null,
    var kind: Int = 0,
    var active: Boolean = true
)
