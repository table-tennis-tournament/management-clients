package de.ttt.management.registration.domain.match

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "matches")
class Match(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Matc_ID")
    var id: Long? = null,

    @Column(name = "Matc_IsPlaying")
    var isPlaying: Boolean = false,

    @Column(name = "Matc_Play1_ID")
    var team1Id: Long? = null,

    @Column(name = "Matc_Play2_ID")
    var team2Id: Long? = null,

    @Column(name = "Matc_Tabl_ID")
    var tableId: Long? = null,

    @Column(name = "Matc_Played")
    var isPlayed: Boolean = false,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Matc_MaTy_ID")
    var matchType: MatchType? = null,

    @Column(name = "Matc_Type_ID")
    var disciplineId: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Matc_Grou_ID")
    var group: PlayGroup? = null,

    @Column(name = "Matc_StartTime")
    var startTime: LocalDateTime? = null,

    @Column(name = "Matc_ResultRaw")
    var resultRaw: String? = null,

    @Column(name = "Matc_Result")
    var result: String? = null,

    @Column(name = "Matc_Balls1")
    var balls1: Int = 0,

    @Column(name = "Matc_Balls2")
    var balls2: Int = 0,

    @Column(name = "Matc_Sets1")
    var sets1: Int = 0,

    @Column(name = "Matc_Sets2")
    var sets2: Int = 0,

    @Column(name = "Matc_PlannedTable_ID")
    var plannedTableId: Long? = null,

    @Column(name = "Matc_Nr")
    var nr: Int = 0,

    @Column(name = "Matc_RoundNumber")
    var roundNumber: Int = 0,

    @Column(name = "Matc_Winner_ID")
    var winnerId: Long? = null
)
