package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.player.Club
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ClubRepository : JpaRepository<Club, Long>
