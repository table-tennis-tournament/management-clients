package de.ttt.management.registration.domain.player

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DoublePlayerRepository : JpaRepository<DoublePlayer, Long>
