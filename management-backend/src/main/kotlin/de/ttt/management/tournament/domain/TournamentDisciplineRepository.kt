package de.ttt.management.tournament.domain
import java.util.*
interface TournamentDisciplineRepository {
    fun findAll(): List<TournamentDiscipline>
    fun findById(id: Long): Optional<TournamentDiscipline>
}
