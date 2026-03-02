package de.ttt.management.table

import java.util.*

interface TTTableRepository {
    fun findAll(): List<TTTable>
    fun findById(id: Long): Optional<TTTable>
    fun save(table: TTTable): TTTable
    fun deleteAll()
}
