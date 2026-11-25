package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.DisciplineParticipation
import de.ttt.management.tournament.domain.GroupPlace
import de.ttt.management.tournament.domain.ParticipationFacts
import de.ttt.management.tournament.domain.ParticipationFactsRepository
import de.ttt.management.tournament.domain.ParticipationMatch
import de.ttt.management.tournament.domain.Registration
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository

@Repository
class JdbcParticipationFactsRepository(private val jdbcClient: JdbcClient) : ParticipationFactsRepository {

    override fun load(): ParticipationFacts {
        val matches = jdbcClient.sql(
            "SELECT matc_type_id, matc_grou_id, matc_play1_id, matc_play2_id, matc_winner_id FROM matches WHERE matc_type_id > 0"
        ).query { rs, _ ->
            ParticipationMatch(
                typeId = rs.getLong("matc_type_id"),
                groupId = rs.longOrNull("matc_grou_id"),
                side1Id = rs.longOrNull("matc_play1_id"),
                side2Id = rs.longOrNull("matc_play2_id"),
                hasResult = rs.longOrNull("matc_winner_id") != null
            )
        }.list()

        val groupPlaces = jdbcClient.sql(
            """
            SELECT ppg.ppgr_play_id, ppg.ppgr_grou_id, ppg.ppgr_position, g.grou_type_id, g.grou_qualpos
            FROM playerpergroup ppg JOIN playgroups g ON g.grou_id = ppg.ppgr_grou_id
            WHERE ppg.ppgr_play_id > 0 AND g.grou_type_id > 0
            """.trimIndent()
        ).query { rs, _ ->
            GroupPlace(
                sideId = rs.getLong("ppgr_play_id"),
                groupId = rs.getLong("ppgr_grou_id"),
                typeId = rs.getLong("grou_type_id"),
                position = rs.getInt("ppgr_position"),
                qualifyingPlaces = rs.getString("grou_qualpos")?.trim()?.toIntOrNull()
                    ?: DisciplineParticipation.DEFAULT_QUALIFYING_PLACES
            )
        }.list()

        val singles = jdbcClient.sql("SELECT typl_play_id, typl_type_id FROM typeperplayer")
            .query { rs, _ -> Registration(rs.getLong("typl_play_id"), rs.getLong("typl_type_id")) }
            .list()
        val teams = jdbcClient.sql("SELECT doub_id, doub_play1_id, doub_play2_id, doub_type_id FROM doubles")
            .query { rs, _ ->
                val side = DisciplineParticipation.DOUBLES_SIDE_OFFSET + rs.getLong("doub_id")
                Triple(side, listOf(rs.getLong("doub_play1_id"), rs.getLong("doub_play2_id")), rs.getLong("doub_type_id"))
            }
            .list()

        return ParticipationFacts(
            matches = matches,
            groupPlaces = groupPlaces,
            registrations = singles + teams.map { (side, _, type) -> Registration(side, type) },
            teamPlayers = teams.associate { (side, players, _) -> side to players }
        )
    }

    /** mktt writes `0` for a missing id. */
    private fun java.sql.ResultSet.longOrNull(column: String): Long? =
        getObject(column)?.let { (it as Number).toLong() }?.takeIf { it > 0 }
}
