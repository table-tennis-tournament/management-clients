package de.ttt.management.table

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface TTTableRepository : JpaRepository<TTTable, Long>
