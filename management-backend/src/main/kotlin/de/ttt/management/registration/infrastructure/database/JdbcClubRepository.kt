package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.player.Club
import de.ttt.management.registration.domain.player.ClubRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcClubRepository(private val jdbcClient: JdbcClient) : ClubRepository {

    private val rowMapper = RowMapper { rs, _ ->
        Club(
            id = rs.getLong("club_id"),
            name = rs.getString("club_name")
        )
    }

    override fun findAll(): List<Club> {
        return jdbcClient.sql("SELECT * FROM club").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<Club> {
        return jdbcClient.sql("SELECT * FROM club WHERE club_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(club: Club): Club {
        if (club.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO club (club_name) VALUES (:name)").param("name", club.name).update(keyHolder)
            club.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE club SET club_name = :name WHERE club_id = :id")
                .param("name", club.name).param("id", club.id).update()
        }
        return club
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM club").update()
    }
}
