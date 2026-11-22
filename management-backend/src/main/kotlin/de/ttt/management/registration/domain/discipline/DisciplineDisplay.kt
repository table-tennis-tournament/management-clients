package de.ttt.management.registration.domain.discipline

/** How the clients show a discipline: its colors and its short name, each optional. */
data class DisciplineDisplay(
    val disciplineId: Long,
    val bgColor: String? = null,
    val textColor: String? = null,
    val shortName: String? = null
)

interface DisciplineDisplayRepository {
    fun findAll(): List<DisciplineDisplay>
    fun saveColors(disciplineId: Long, bgColor: String, textColor: String)
    /** Sets the short name; `null` removes it. */
    fun saveShortName(disciplineId: Long, shortName: String?)
}
