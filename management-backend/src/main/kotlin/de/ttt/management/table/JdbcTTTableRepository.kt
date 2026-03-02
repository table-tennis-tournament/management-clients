package de.ttt.management.table

import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.jdbc.support.GeneratedKeyHolder
import org.springframework.stereotype.Repository
import java.util.*

@Repository
class JdbcTTTableRepository(private val jdbcClient: JdbcClient) : TTTableRepository {

    private val rowMapper = RowMapper { rs, _ ->
        TTTable(
            id = rs.getLong("Tabl_ID"),
            name = rs.getString("Tabl_Name"),
            active = true // Tables in this schema don't seem to have an active flag
        )
    }

    override fun findAll(): List<TTTable> {
        return jdbcClient.sql("SELECT * FROM tables").query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<TTTable> {
        return jdbcClient.sql("SELECT * FROM tables WHERE Tabl_ID = :id").param("id", id).query(rowMapper).optional()
    }

    override fun save(table: TTTable): TTTable {
        if (table.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO tables (Tabl_Name) VALUES (:name)")
                .param("name", table.name).update(keyHolder)
            table.id = keyHolder.key?.toLong()
        } else {
            jdbcClient.sql("UPDATE tables SET Tabl_Name = :name WHERE Tabl_ID = :id")
                .param("name", table.name).param("id", table.id).update()
        }
        return table
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM tables").update()
    }
}
