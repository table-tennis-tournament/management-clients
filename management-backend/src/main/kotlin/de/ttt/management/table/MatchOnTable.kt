package de.ttt.management.table

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "matchtable")
class MatchOnTable(
    @Id
    @Column(name = "id", columnDefinition = "CHAR(36)")
    var id: UUID? = null,

    @Column(name = "tableId")
    var tableId: Long? = null,

    @Column(name = "matchId")
    var matchId: Long? = null,

    @Column(name = "timestamp")
    var timestamp: LocalDateTime? = null
)
