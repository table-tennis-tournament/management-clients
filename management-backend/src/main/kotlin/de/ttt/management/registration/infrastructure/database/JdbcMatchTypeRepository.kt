package de.ttt.management.registration.infrastructure.database

import de.ttt.management.registration.domain.match.MatchType
import de.ttt.management.registration.domain.match.MatchTypeRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcMatchTypeRepository(private val jdbcClient: JdbcClient) : MatchTypeRepository {

    private val rowMapper = RowMapper { rs, _ ->
        MatchType(
            id = rs.getLong("ma_ty_id"),
            name = rs.getString("ma_ty_name")
        )
    }

    override fun findAll(): List<MatchType> {
        return jdbcClient.sql("SELECT * FROM matchtype").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<MatchType> {
        return jdbcClient.sql("SELECT * FROM matchtype WHERE ma_ty_id = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(matchType: MatchType): MatchType {
        if (matchType.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO matchtype (ma_ty_name) VALUES (:name)").param("name", matchType.name).update(keyHolder)
            matchType.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE matchtype SET ma_ty_name = :name WHERE ma_ty_id = :id")
                .param("name", matchType.name).param("id", matchType.id).update()
        }
        return matchType
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM matchtype").update()
    }
}
