package de.ttt.management.tournament.domain

import java.util.UUID

data class MatchList(
    val uuid: String = UUID.randomUUID().toString(),
    val matchIds: List<Long>,
    val asGroup: Long? = null,
    var position: Int
)

data class MatchListInfo(
    val matchList: MatchList
    // We can add detailed Match info later if needed, mimicking the Scala `MatchListInfo`
)
