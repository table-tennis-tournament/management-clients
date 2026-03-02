package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.player.DoublePlayer
import de.ttt.management.registration.domain.player.DoublePlayerRepository
import de.ttt.management.registration.domain.player.Player
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcDoublePlayerRepository(private val jdbcClient: JdbcClient) : DoublePlayerRepository {

    private val rowMapper = RowMapper { rs, _ ->
        val p1Id = rs.getObject("doub_play1_id", Long::class.java)
        val p2Id = rs.getObject("doub_play2_id", Long::class.java)
        DoublePlayer(
            id = rs.getLong("doub_id"),
            player1 = p1Id?.let { Player(id = it) },
            player2 = p2Id?.let { Player(id = it) },
            kind = rs.getInt("doub_kind")
        )
    }

    override fun findAll(): List<DoublePlayer> {
        return jdbcClient.sql("SELECT * FROM doubles").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<DoublePlayer> {
        return jdbcClient.sql("SELECT * FROM doubles WHERE doub_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(doublePlayer: DoublePlayer): DoublePlayer {
        if (doublePlayer.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO doubles (doub_play1_id, doub_play2_id, doub_kind) VALUES (:p1, :p2, :kind)")
                .param("p1", doublePlayer.player1?.id)
                .param("p2", doublePlayer.player2?.id)
                .param("kind", doublePlayer.kind)
                .update(keyHolder)
            doublePlayer.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE doubles SET doub_play1_id = :p1, doub_play2_id = :p2, doub_kind = :kind WHERE doub_id = :id")
                .param("p1", doublePlayer.player1?.id)
                .param("p2", doublePlayer.player2?.id)
                .param("kind", doublePlayer.kind)
                .param("id", doublePlayer.id)
                .update()
        }
        return doublePlayer
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM doubles").update()
    }
}
