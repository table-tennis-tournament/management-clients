package de.ttt.management.registration.domain.discipline

/** The short names of the disciplines, by discipline id. A discipline without one is shown by its full name. */
interface DisciplineShortNameRepository {
    fun findAll(): Map<Long, String>
    fun save(disciplineId: Long, shortName: String)
    fun delete(disciplineId: Long)
}
