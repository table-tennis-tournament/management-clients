package de.ttt.management.grouping.domain

interface PlayerPerGroupRepository {
    fun findByGroupId(groupId: Long): List<PlayerPerGroup>
    fun save(playerPerGroup: PlayerPerGroup)
}
