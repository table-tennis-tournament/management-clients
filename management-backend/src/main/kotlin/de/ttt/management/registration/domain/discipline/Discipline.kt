package de.ttt.management.registration.domain.discipline

import jakarta.persistence.*

@Entity
@Table(name = "type")
class Discipline(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Type_ID")
    var id: Long? = null,

    @Column(name = "Type_Name")
    var name: String? = null,

    @Column(name = "Type_Kind")
    var kind: Int? = null,

    @Column(name = "Type_Active")
    var active: Boolean = false
)
