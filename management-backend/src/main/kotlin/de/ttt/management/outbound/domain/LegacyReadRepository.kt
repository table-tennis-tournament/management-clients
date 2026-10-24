package de.ttt.management.outbound.domain

interface LegacyReadRepository {
    fun fetchAllMatches(): List<LegacyMatchInfo>
    fun fetchAllTables(): List<LegacyTableInfo>
    fun fetchMatchList(): List<LegacyMatchListInfo>
    fun fetchTableManagerTables(): List<LegacyTableManagerTableInfo>
}
