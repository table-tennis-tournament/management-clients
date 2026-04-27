package de.ttt.management.registration.domain.discipline
import java.util.*
interface DisciplineColorRepository {
    fun findAll(): List<DisciplineColor>
    fun findByDisciplineId(disciplineId: Long): Optional<DisciplineColor>
    fun save(disciplineColor: DisciplineColor): DisciplineColor
    fun deleteAll()
}
