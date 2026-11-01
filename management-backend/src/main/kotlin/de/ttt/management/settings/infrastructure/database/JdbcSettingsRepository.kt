package de.ttt.management.settings.infrastructure.database

import de.ttt.management.settings.domain.Setting
import de.ttt.management.settings.domain.SettingsRepository
import org.springframework.jdbc.core.RowMapper
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository

@Repository
class JdbcSettingsRepository(private val jdbcClient: JdbcClient) : SettingsRepository {

    private val rowMapper = RowMapper { rs, _ ->
        Setting(
            id = rs.getLong("ID"),
            name = rs.getString("Name"),
            value = rs.getString("Value")
        )
    }

    override fun findAll(): List<Setting> {
        return jdbcClient.sql("SELECT * FROM settings").query(rowMapper).list()
    }

    override fun save(setting: Setting): Setting {
        return setting
    }
}
