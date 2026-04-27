package de.ttt.management.tournament.domain
data class TournamentPlayer(
    var id: Long? = null,
    var firstName: String? = null,
    var lastName: String? = null,
    var ttr: Int? = null,
    var paid: Boolean = false
)
