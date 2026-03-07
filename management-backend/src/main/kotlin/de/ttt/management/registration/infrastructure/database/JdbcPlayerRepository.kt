package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.player.Club
import de.ttt.management.registration.domain.player.Player
import de.ttt.management.registration.domain.player.PlayerRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcPlayerRepository(private val jdbcClient: JdbcClient) : PlayerRepository {

    private val rowMapper = RowMapper { rs, _ ->
        val clubId = rs.getObject("play_club_id")?.let { (it as Number).toLong() }
        val club = clubId?.let { Club(id = it) }
        Player(
            id = rs.getLong("play_id"),
            firstName = rs.getString("play_firstname"),
            lastName = rs.getString("play_lastname"),
            email = rs.getString("play_email"),
            telNr = rs.getString("play_telnr"),
            location = rs.getString("play_location"),
            street = rs.getString("play_street"),
            plz = rs.getString("play_plz"),
            sex = rs.getString("play_sex"),
            ttr = rs.getInt("play_ttr"),
            club = club,
            paid = rs.getBoolean("play_paid")
        )
    }

    override fun findAll(): List<Player> {
        return jdbcClient.sql("SELECT * FROM player").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<Player> {
        return jdbcClient.sql("SELECT * FROM player WHERE play_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(player: Player): Player {
        if (player.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("""
                INSERT INTO player (play_firstname, play_lastname, play_email, play_telnr, play_location, play_street, play_plz, play_sex, play_ttr, play_club_id, play_paid)
                VALUES (:firstName, :lastName, :email, :telNr, :location, :street, :plz, :sex, :ttr, :clubId, :paid)
            """.trimIndent())
                .param("firstName", player.firstName)
                .param("lastName", player.lastName)
                .param("email", player.email)
                .param("telNr", player.telNr)
                .param("location", player.location)
                .param("street", player.street)
                .param("plz", player.plz)
                .param("sex", player.sex)
                .param("ttr", player.ttr)
                .param("clubId", player.club?.id)
                .param("paid", player.paid)
                .update(keyHolder)
            player.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("""
                UPDATE player SET play_firstname = :firstName, play_lastname = :lastName, play_email = :email, play_telnr = :telNr, 
                play_location = :location, play_street = :street, play_plz = :plz, play_sex = :sex, play_ttr = :ttr, play_club_id = :clubId, play_paid = :paid
                WHERE play_id = :id
            """.trimIndent())
                .param("firstName", player.firstName)
                .param("lastName", player.lastName)
                .param("email", player.email)
                .param("telNr", player.telNr)
                .param("location", player.location)
                .param("street", player.street)
                .param("plz", player.plz)
                .param("sex", player.sex)
                .param("ttr", player.ttr)
                .param("clubId", player.club?.id)
                .param("paid", player.paid)
                .param("id", player.id)
                .update()
        }
        return player
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM player").update()
    }
}
