package de.ttt.management.player

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DoublePlayerRepository : JpaRepository<DoublePlayer, Long>
