package de.ttt.management.registration.domain.match

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MatchTypeRepository : JpaRepository<MatchType, Long>
