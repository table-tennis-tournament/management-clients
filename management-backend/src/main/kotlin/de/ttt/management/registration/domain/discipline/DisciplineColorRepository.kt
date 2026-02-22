package de.ttt.management.registration.domain.discipline

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DisciplineColorRepository : JpaRepository<DisciplineColor, Long>
