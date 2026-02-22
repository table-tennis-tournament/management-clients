package de.ttt.management.registration.domain.discipline

import jakarta.persistence.*

@Entity
@Table(name = "typecolors")
class DisciplineColor(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tyco_id")
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tyco_type_id")
    var discipline: Discipline? = null,

    @Column(name = "tyco_bg_color")
    var bgColor: String? = null,

    @Column(name = "tyco_text_color")
    var textColor: String? = null
)
