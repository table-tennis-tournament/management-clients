package de.ttt.management.tournament.infrastructure.database

import de.ttt.management.tournament.domain.TTTable
import de.ttt.management.tournament.domain.TTTableRepository
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
            active = true,
            isLocked = rs.getInt("tabl_locked") > 0
        )
    }

    private fun selectTables(sql: String): String =
        "SELECT t.*, COALESCE(tl.locked, 0) AS tabl_locked FROM tables t " +
            "LEFT JOIN mgmt_table_lock tl ON tl.tabl_id = t.tabl_id " +
            "WHERE t.tabl_name != '0' $sql"

    override fun findAll(): List<TTTable> {
        return jdbcClient.sql(selectTables("")).query(rowMapper).list()
    }

    override fun findById(id: Long): Optional<TTTable> {
        return jdbcClient.sql(selectTables("AND t.tabl_id = :id")).param("id", id).query(rowMapper).optional()
    }

    override fun findByName(name: String): Optional<TTTable> {
        return jdbcClient.sql(selectTables("AND t.tabl_name = :name")).param("name", name).query(rowMapper).optional()
    }

    override fun save(table: TTTable): TTTable {
        if (table.id == null) {
            val keyHolder = GeneratedKeyHolder()
            jdbcClient.sql("INSERT INTO tables (Tabl_Name) VALUES (:name)")
                .param("name", table.name)
                .update(keyHolder)
            table.id = (keyHolder.keys?.get("tabl_id") as? Number)?.toLong()
        } else {
            jdbcClient.sql("UPDATE tables SET Tabl_Name = :name WHERE Tabl_ID = :id")
                .param("name", table.name)
                .param("id", table.id).update()
        }
        setLocked(table.id!!, table.isLocked)
        return table
    }

    override fun setLocked(id: Long, locked: Boolean): Int {
        val exists = jdbcClient.sql("SELECT tabl_id FROM tables WHERE tabl_id = :id")
            .param("id", id)
            .query { rs, _ -> rs.getLong("tabl_id") }
            .optional()
            .isPresent
        if (!exists) return 0
        return if (locked) {
            jdbcClient.sql("INSERT INTO mgmt_table_lock (tabl_id, locked) VALUES (:id, 1) ON DUPLICATE KEY UPDATE locked = 1")
                .param("id", id)
                .update()
        } else {
            jdbcClient.sql("DELETE FROM mgmt_table_lock WHERE tabl_id = :id")
                .param("id", id)
                .update()
        }
    }

    override fun deleteAll() {
        jdbcClient.sql("DELETE FROM tables").update()
    }
}
