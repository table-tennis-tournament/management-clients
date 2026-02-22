package de.ttt.management.registration.domain.match

import jakarta.persistence.*

@Entity
@Table(name = "playgroups")
class PlayGroup(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Grou_ID")
    var id: Long? = null,

    @Column(name = "Grou_Name")
    var name: String? = null
)
