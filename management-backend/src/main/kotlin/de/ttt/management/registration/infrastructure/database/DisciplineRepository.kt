package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.Discipline
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DisciplineRepository : JpaRepository<Discipline, Long>
