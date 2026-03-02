package de.ttt.management.registration.domain.player

import java.util.*

interface ClubRepository {
    fun findAll(): List<Club>
    fun findById(id: Long): Optional<Club>
    fun save(club: Club): Club
    fun deleteAll()
}
