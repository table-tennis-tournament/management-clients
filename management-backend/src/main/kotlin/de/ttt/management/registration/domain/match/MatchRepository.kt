package de.ttt.management.registration.domain.match

import de.ttt.management.registration.domain.match.Match
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository : JpaRepository<Match, Long>