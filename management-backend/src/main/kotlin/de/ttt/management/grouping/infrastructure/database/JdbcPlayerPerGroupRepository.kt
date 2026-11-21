package de.ttt.management.grouping.infrastructure.database

import de.ttt.management.grouping.domain.PlayerPerGroup
import de.ttt.management.grouping.domain.PlayerPerGroupRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository

@Repository
class JdbcPlayerPerGroupRepository(private val jdbcClient: JdbcClient) : PlayerPerGroupRepository {

    private val rowMapper = RowMapper { rs, _ ->
        PlayerPerGroup(
            id = rs.getLong("ppgr_id"),
            playerId = rs.getLong("ppgr_play_id"),
            groupId = rs.getLong("ppgr_grou_id"),
            position = rs.getInt("ppgr_position"),
            matchesWon = rs.getInt("ppgr_gamesw"),
            matchesLost = rs.getInt("ppgr_gamesl"),
            setsWon = rs.getInt("ppgr_setw"),
            setsLost = rs.getInt("ppgr_setl"),
            pointsWon = rs.getInt("ppgr_pointsw"),
            pointsLost = rs.getInt("ppgr_pointsl"),
            games = rs.getString("ppgr_games") ?: "0 : 0",
            sets = rs.getString("ppgr_sets") ?: "0 : 0",
            points = rs.getString("ppgr_points") ?: "0 : 0",
            checked = rs.getInt("ppgr_checked") > 0,
            setsDiff = rs.getInt("ppgr_setdiff")
        )
    }

    override fun findByGroupId(groupId: Long): List<PlayerPerGroup> =
        jdbcClient.sql("SELECT * FROM playerpergroup WHERE ppgr_grou_id = :groupId")
            .param("groupId", groupId)
            .query(rowMapper)
            .list()

    override fun save(playerPerGroup: PlayerPerGroup) {
        jdbcClient.sql(
            """
            UPDATE playerpergroup SET
                ppgr_position = :position, ppgr_gamesw = :matchesWon, ppgr_gamesl = :matchesLost,
                ppgr_setw = :setsWon, ppgr_setl = :setsLost, ppgr_pointsw = :pointsWon, ppgr_pointsl = :pointsLost,
                ppgr_games = :games, ppgr_sets = :sets, ppgr_points = :points,
                ppgr_checked = :checked, ppgr_setdiff = :setsDiff
            WHERE ppgr_id = :id
            """.trimIndent()
        )
            .param("position", playerPerGroup.position)
            .param("matchesWon", playerPerGroup.matchesWon)
            .param("matchesLost", playerPerGroup.matchesLost)
            .param("setsWon", playerPerGroup.setsWon)
            .param("setsLost", playerPerGroup.setsLost)
            .param("pointsWon", playerPerGroup.pointsWon)
            .param("pointsLost", playerPerGroup.pointsLost)
            .param("games", playerPerGroup.games)
            .param("sets", playerPerGroup.sets)
            .param("points", playerPerGroup.points)
            .param("checked", if (playerPerGroup.checked) 1 else 0)
            .param("setsDiff", playerPerGroup.setsDiff)
            .param("id", playerPerGroup.id)
            .update()
    }
}
