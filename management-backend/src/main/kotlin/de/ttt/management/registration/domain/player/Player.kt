package de.ttt.management.registration.domain.player

class Player(
    var id: Long? = null,
    var firstName: String? = null,
    var lastName: String? = null,
    var email: String? = null,
    var telNr: String? = null,
    var location: String? = null,
    var street: String? = null,
    var plz: String? = null,
    var sex: String? = null,
    var ttr: Int? = null,
    var club: Club? = null,
    var paid: Boolean = false
)
