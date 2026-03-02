package de.ttt.management.registration.domain.match

import java.util.*

interface PlayGroupRepository {
    fun findAll(): List<PlayGroup>
    fun findById(id: Long): Optional<PlayGroup>
    fun save(playGroup: PlayGroup): PlayGroup
    fun deleteAll()
}
