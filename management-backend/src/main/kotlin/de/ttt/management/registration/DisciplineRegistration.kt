package de.ttt.management.registration

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "typeperplayer")
class DisciplineRegistration(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "typl_id")
    var id: Long? = null,

    @Column(name = "typl_play_id")
    var playerId: Long? = null,

    @Column(name = "typl_type_id")
    var disciplineId: Long? = null,

    @Column(name = "typl_seed")
    var seed: Long? = null,

    @Column(name = "typl_paid")
    var paid: Boolean = false,

    @Column(name = "typl_timestamp")
    var timestamp: String? = null,

    @Column(name = "typl_Cash_ID")
    var cashId: Long? = null,

    @Column(name = "Typl_ExternalID")
    var externalId: String? = null
)
