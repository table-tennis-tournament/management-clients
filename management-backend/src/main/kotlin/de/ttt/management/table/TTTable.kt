package de.ttt.management.table

import jakarta.persistence.*

@Entity
@Table(name = "tables")
class TTTable(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Tabl_ID")
    var id: Long? = null,

    @Column(name = "Tabl_Name")
    var name: Int? = null,

    @Column(name = "Tabl_Left")
    var left: Long? = null,

    @Column(name = "Tabl_Top")
    var top: Long? = null,

    @Column(name = "Tabl_Tour_ID")
    var tourId: Long? = null,

    @Column(name = "Tabl_Group")
    var groupId: Long? = null
)
