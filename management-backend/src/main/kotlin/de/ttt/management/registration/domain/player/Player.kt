package de.ttt.management.registration.domain.player

import jakarta.persistence.*

@Entity
@Table(name = "player")
class Player(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Play_ID")
    var id: Long? = null,

    @Column(name = "Play_FirstName")
    var firstName: String? = null,

    @Column(name = "Play_LastName")
    var lastName: String? = null,

    @Column(name = "Play_TTR")
    var ttr: Int? = null,

    @Column(name = "Play_Sex")
    var sex: String? = null,

    @Column(name = "Play_Paid")
    var paid: Boolean = false,

    @Column(name = "Play_Email")
    var email: String? = null,

    @Column(name = "Play_PLZ")
    var zipCode: String? = null,

    @Column(name = "Play_Location")
    var location: String? = null,

    @Column(name = "Play_Street")
    var street: String? = null,

    @Column(name = "Play_TelNr")
    var phone: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Play_Club_ID")
    var club: Club? = null
)
