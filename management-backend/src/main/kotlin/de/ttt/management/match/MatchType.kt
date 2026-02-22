package de.ttt.management.match

import jakarta.persistence.*

@Entity
@Table(name = "matchtype")
class MatchType(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MaTy_ID")
    var id: Long? = null,

    @Column(name = "MaTy_Name")
    var name: String? = null
)
