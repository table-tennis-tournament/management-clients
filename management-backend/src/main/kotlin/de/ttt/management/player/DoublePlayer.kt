package de.ttt.management.player

import jakarta.persistence.*

@Entity
@Table(name = "doubles")
class DoublePlayer(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Doub_ID")
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Doub_Play1_ID")
    var player1: Player? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Doub_Play2_ID")
    var player2: Player? = null,

    @Column(name = "Doub_Kind")
    var kindId: Int? = null
)
