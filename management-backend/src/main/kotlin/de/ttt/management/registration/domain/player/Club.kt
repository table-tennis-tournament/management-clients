package de.ttt.management.registration.domain.player

import jakarta.persistence.*

@Entity
@Table(name = "club")
class Club(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Club_ID")
    var id: Long? = null,

    @Column(name = "Club_Name")
    var name: String? = null
)
