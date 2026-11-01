package de.ttt.management.settings.infrastructure.database

import de.ttt.management.settings.domain.MatchPrintInfo
import de.ttt.management.settings.domain.MatchPrintRepository
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcMatchPrintRepository(private val jdbcClient: JdbcClient) : MatchPrintRepository {

    override fun findById(id: Long): Optional<MatchPrintInfo> {
        val row = jdbcClient.sql(
            """
            SELECT m.matc_id, m.matc_roundnumber, m.matc_play1_id, m.matc_play2_id,
                   t.type_name AS discipline_name,
                   g.grou_name AS group_name,
                   mt.maty_name AS match_type_name,
                   tb.tabl_name AS table_name
            FROM matches m
            LEFT JOIN type t ON t.type_id = m.matc_type_id
            LEFT JOIN playgroups g ON g.grou_id = m.matc_grou_id
            LEFT JOIN matchtype mt ON mt.maty_id = m.matc_maty_id
            LEFT JOIN tables tb ON tb.tabl_id = m.matc_tabl_id
            WHERE m.matc_id = :id
            """.trimIndent()
        )
            .param("id", id)
            .query { rs, _ ->
                Row(
                    id = rs.getLong("matc_id"),
                    roundNumber = rs.getObject("matc_roundnumber")?.let { (it as Number).toInt() },
                    player1Id = rs.getObject("matc_play1_id")?.let { (it as Number).toLong() },
                    player2Id = rs.getObject("matc_play2_id")?.let { (it as Number).toLong() },
                    disciplineName = rs.getString("discipline_name"),
                    groupName = rs.getString("group_name"),
                    matchTypeName = rs.getString("match_type_name"),
                    tableName = rs.getString("table_name")
                )
            }
            .optional()

        return row.map {
            MatchPrintInfo(
                id = it.id,
                disciplineName = it.disciplineName,
                groupName = it.groupName,
                matchTypeName = it.matchTypeName,
                roundNumber = it.roundNumber,
                tableNumber = it.tableName,
                player1Names = resolvePlayerNames(it.player1Id),
                player2Names = resolvePlayerNames(it.player2Id)
            )
        }
    }

    private fun resolvePlayerNames(rawId: Long?): List<String> {
        if (rawId == null || rawId == 0L) return emptyList()
        if (rawId >= 100000) {
            val memberIds = jdbcClient.sql("SELECT doub_play1_id, doub_play2_id FROM doubles WHERE doub_id = :id")
                .param("id", rawId - 100000)
                .query { rs, _ -> listOf(rs.getLong("doub_play1_id"), rs.getLong("doub_play2_id")) }
                .optional()
                .orElse(emptyList())
            return memberIds.flatMap { resolvePlayerNames(it) }
        }
        val name = jdbcClient.sql("SELECT play_lastname, play_firstname FROM player WHERE play_id = :id")
            .param("id", rawId)
            .query { rs, _ ->
                listOfNotNull(rs.getString("play_lastname"), rs.getString("play_firstname"))
                    .joinToString(", ")
            }
            .optional()
            .orElse("")
        return listOf(name)
    }

    private data class Row(
        val id: Long,
        val roundNumber: Int?,
        val player1Id: Long?,
        val player2Id: Long?,
        val disciplineName: String?,
        val groupName: String?,
        val matchTypeName: String?,
        val tableName: String?
    )
}
