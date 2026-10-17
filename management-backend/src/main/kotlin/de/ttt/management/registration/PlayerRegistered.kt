package de.ttt.management.registration

data class PlayerRegistered(
    val playerId: Long,
    val firstName: String?,
    val lastName: String?
)

data class PlayerUnregistered(
    val playerId: Long
)
