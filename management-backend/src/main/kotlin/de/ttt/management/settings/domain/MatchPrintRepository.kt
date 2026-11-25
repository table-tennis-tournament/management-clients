package de.ttt.management.settings.domain

import java.util.*

interface MatchPrintRepository {
    fun findById(id: Long): Optional<MatchPrintInfo>
}
