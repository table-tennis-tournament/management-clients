package de.ttt.management.grouping.domain

interface PlayerPerGroupRepository {
    fun findByGroupId(groupId: Long): List<PlayerPerGroup>
    /** The standings of every group of discipline [disciplineId]. */
    fun findByDisciplineId(disciplineId: Long): List<PlayerPerGroup>
    fun save(playerPerGroup: PlayerPerGroup)
}
