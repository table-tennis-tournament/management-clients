package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.player.DoublePlayer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DoublePlayerRepository : JpaRepository<DoublePlayer, Long>
