package de.ttt.management.outbound.domain

/**
 * The part of the tournament an update event refers to. Clients use it to ignore events
 * that do not concern what they currently display. An empty list means that the event
 * does not touch that dimension.
 */
data class UpdateScope(
    val matchIds: List<Long> = emptyList(),
    val typeIds: List<Long> = emptyList(),
    val tableIds: List<Long> = emptyList()
)
