package de.ttt.management.grouping.domain

interface GroupMatchRepository {
    fun findByMatchId(matchId: Long): GroupMatchResult?
    fun findByGroupId(groupId: Long): List<GroupMatchResult>
}
