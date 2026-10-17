package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.MatchList
import de.ttt.management.tournament.domain.MatchListRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcMatchListRepository(private val jdbcClient: JdbcClient) : MatchListRepository {

    private val rowMapper = RowMapper { rs, _ ->
        MatchList(
            uuid = rs.getString("uuid"),
            matchIds = parseMatchIds(rs.getString("match_ids")),
            asGroup = rs.getObject("as_group")?.let { (it as Number).toLong() },
            position = rs.getInt("position")
        )
    }

    override fun findAll(): List<MatchList> =
        jdbcClient.sql("SELECT * FROM match_list ORDER BY position").query(rowMapper).list()

    override fun findById(uuid: String): Optional<MatchList> =
        jdbcClient.sql("SELECT * FROM match_list WHERE uuid = :uuid")
            .param("uuid", uuid)
            .query(rowMapper)
            .optional()

    override fun save(entry: MatchList): MatchList {
        if (findById(entry.uuid).isEmpty) {
            jdbcClient.sql(
                """
                INSERT INTO match_list (uuid, match_ids, as_group, position)
                VALUES (:uuid, :matchIds, :asGroup, :position)
                """.trimIndent()
            )
                .param("uuid", entry.uuid)
                .param("matchIds", toMatchIds(entry.matchIds))
                .param("asGroup", entry.asGroup)
                .param("position", entry.position)
                .update()
        } else {
            jdbcClient.sql(
                """
                UPDATE match_list
                SET match_ids = :matchIds, as_group = :asGroup, position = :position
                WHERE uuid = :uuid
                """.trimIndent()
            )
                .param("matchIds", toMatchIds(entry.matchIds))
                .param("asGroup", entry.asGroup)
                .param("position", entry.position)
                .param("uuid", entry.uuid)
                .update()
        }
        return entry
    }

    override fun deleteById(uuid: String): Boolean =
        jdbcClient.sql("DELETE FROM match_list WHERE uuid = :uuid").param("uuid", uuid).update() > 0

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM match_list").update()
    }

    private fun toMatchIds(matchIds: List<Long>): String = matchIds.joinToString(",")

    private fun parseMatchIds(raw: String?): List<Long> =
        if (raw.isNullOrBlank()) emptyList() else raw.split(",").map { it.trim().toLong() }
}
