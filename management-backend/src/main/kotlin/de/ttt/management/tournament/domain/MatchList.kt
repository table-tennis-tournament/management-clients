package de.ttt.management.tournament.domain

data class MatchList(
    val uuid: String,
    val matchIds: List<Long>,
    val asGroup: Long? = null,
    var position: Int
)
