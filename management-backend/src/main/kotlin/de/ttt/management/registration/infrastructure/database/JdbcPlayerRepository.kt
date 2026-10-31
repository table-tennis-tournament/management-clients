package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.PlayerTypeRegistration
import de.ttt.management.registration.domain.discipline.Discipline
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
        val club = clubId?.let { Club(id = it, name = rs.getString("club_name")) }
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
            ttr = rs.getObject("play_ttr")?.let { (it as Number).toInt() },
            club = club,
            paid = rs.getInt("play_paid") > 0,
            active = rs.getInt("play_active") > 0
        )
    }

    private fun selectPlayers(sql: String): String =
        "SELECT p.*, COALESCE(pa.active, 1) AS play_active, c.club_name FROM player p " +
            "LEFT JOIN mgmt_player_active pa ON pa.play_id = p.play_id " +
            "LEFT JOIN club c ON c.club_id = p.play_club_id $sql"

    override fun findAll(): List<Player> {
        return jdbcClient.sql(selectPlayers("")).query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<Player> {
        return jdbcClient.sql(selectPlayers("WHERE p.play_id = :id")).param("id", id).query(rowMapper).optional()
    }

    override fun findByTypeId(typeId: Long): List<Player> {
        return jdbcClient.sql(
            selectPlayers(
                "JOIN typeperplayer tpp ON p.play_id = tpp.typl_play_id WHERE tpp.typl_type_id = :typeId"
            )
        )
            .param("typeId", typeId)
            .query(rowMapper)
            .list()
    }

    override fun findAllTypePerPlayer(): List<PlayerTypeRegistration> {
        return jdbcClient.sql(
            """
            SELECT tpp.typl_id, tpp.typl_paid,
                   p.play_id, p.play_firstname, p.play_lastname, p.play_ttr, p.play_sex, p.play_club_id,
                   c.club_name,
                   t.type_id, t.type_name, t.type_kind, t.type_active
            FROM typeperplayer tpp
            JOIN player p ON p.play_id = tpp.typl_play_id
            JOIN type t ON t.type_id = tpp.typl_type_id
            LEFT JOIN club c ON c.club_id = p.play_club_id
            WHERE t.type_kind != 2
              AND t.type_id NOT IN (SELECT DISTINCT matc_type_id FROM matches WHERE matc_type_id IS NOT NULL)
            ORDER BY p.play_lastname, p.play_firstname, p.play_id
            """.trimIndent()
        ).query { rs, _ ->
            PlayerTypeRegistration(
                id = rs.getLong("typl_id"),
                player = Player(
                    id = rs.getLong("play_id"),
                    firstName = rs.getString("play_firstname"),
                    lastName = rs.getString("play_lastname"),
                    ttr = rs.getObject("play_ttr")?.let { (it as Number).toInt() },
                    sex = rs.getString("play_sex"),
                    club = rs.getObject("play_club_id")?.let {
                        Club(id = (it as Number).toLong(), name = rs.getString("club_name"))
                    }
                ),
                type = Discipline(
                    id = rs.getLong("type_id"),
                    name = rs.getString("type_name"),
                    kind = rs.getInt("type_kind"),
                    active = rs.getInt("type_active") > 0
                ),
                paid = rs.getInt("typl_paid") > 0
            )
        }.list()
    }

    override fun setTypePerPlayerPaid(typlId: Long, paid: Boolean): Boolean {
        return jdbcClient.sql("UPDATE typeperplayer SET typl_paid = :paid WHERE typl_id = :id")
            .param("paid", if (paid) 1 else 0)
            .param("id", typlId)
            .update() > 0
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
            player.id = (keyHolder.keys?.get("play_id") as? Number)?.toLong()
        } else {
            jdbcClient.sql("""
                UPDATE player 
                SET play_firstname = :firstName, play_lastname = :lastName, play_email = :email, 
                    play_telnr = :telNr, play_location = :location, play_street = :street, 
                    play_plz = :plz, play_sex = :sex, play_ttr = :ttr, play_club_id = :clubId, play_paid = :paid
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
        saveActive(player.id!!, player.active)
        return player
    }

    override fun deleteById(id: Long) {
        jdbcClient.sql("DELETE FROM player WHERE play_id = :id").param("id", id).update()
        jdbcClient.sql("DELETE FROM mgmt_player_active WHERE play_id = :id").param("id", id).update()
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM player").update()
        jdbcClient.sql("DELETE FROM mgmt_player_active").update()
    }

    private fun saveActive(playId: Long, active: Boolean) {
        if (active) {
            jdbcClient.sql("DELETE FROM mgmt_player_active WHERE play_id = :id").param("id", playId).update()
        } else {
            jdbcClient.sql("INSERT INTO mgmt_player_active (play_id, active) VALUES (:id, 0) ON DUPLICATE KEY UPDATE active = 0")
                .param("id", playId).update()
        }
    }
}
