package de.ttt.management.registration

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DisciplineRegistrationRepository : JpaRepository<DisciplineRegistration, Long>
