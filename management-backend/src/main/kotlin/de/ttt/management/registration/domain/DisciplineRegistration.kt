package de.ttt.management.registration.domain

class DisciplineRegistration(
    var id: Long? = null,
    var playerId: Long? = null,
    var disciplineId: Long? = null,
    var seed: Long? = null,
    var paid: Boolean = false,
    var timestamp: String? = null,
    var cashId: Long? = null,
    var externalId: String? = null
)
