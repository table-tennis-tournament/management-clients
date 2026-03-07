package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.match.PlayGroup
import de.ttt.management.registration.domain.match.PlayGroupRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcPlayGroupRepository(private val jdbcClient: JdbcClient) : PlayGroupRepository {

    private val rowMapper = RowMapper { rs, _ ->
        PlayGroup(
            id = rs.getLong("grou_id"),
            name = rs.getString("grou_name")
        )
    }

    override fun findAll(): List<PlayGroup> {
        return jdbcClient.sql("SELECT * FROM `groups`").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<PlayGroup> {
        return jdbcClient.sql("SELECT * FROM `groups` WHERE grou_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(playGroup: PlayGroup): PlayGroup {
        if (playGroup.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO `groups` (grou_name) VALUES (:name)")
                .param("name", playGroup.name).update(keyHolder)
            playGroup.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE `groups` SET grou_name = :name WHERE grou_id = :id")
                .param("name", playGroup.name).param("id", playGroup.id).update()
        }
        return playGroup
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM `groups`").update()
    }
}
