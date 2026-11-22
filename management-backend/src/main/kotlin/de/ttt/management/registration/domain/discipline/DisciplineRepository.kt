package de.ttt.management.registration.domain.discipline
import java.util.*
interface DisciplineRepository {
    fun findAll(): List<Discipline>
    fun findById(id: Long): Optional<Discipline>
}
