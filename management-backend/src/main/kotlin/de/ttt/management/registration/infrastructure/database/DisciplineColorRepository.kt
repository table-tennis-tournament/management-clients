package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.discipline.DisciplineColor
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DisciplineColorRepository : JpaRepository<DisciplineColor, Long>
