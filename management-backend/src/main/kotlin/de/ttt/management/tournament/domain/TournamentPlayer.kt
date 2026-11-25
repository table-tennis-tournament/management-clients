package de.ttt.management.tournament.domain

data class TournamentPlayer(
    var id: Long? = null,
    var firstName: String? = null,
    var lastName: String? = null,
    var ttr: Int? = null,
    var paid: Boolean = false,
    var club: TournamentClub? = null,
    /** The disciplines the player is still in ([DisciplineParticipation]), sorted by id. */
    var types: List<Long> = emptyList()
)

/** The club a player plays for. */
data class TournamentClub(
    val id: Long,
    val name: String?
)
