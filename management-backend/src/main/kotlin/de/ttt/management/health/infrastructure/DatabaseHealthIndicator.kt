package de.ttt.management.health.infrastructure

import org.springframework.boot.health.contributor.Health
import org.springframework.stereotype.Component
import javax.sql.DataSource

/**
 * The database answers: a connection from the pool is valid. Replaces Spring Boot's `db` indicator
 * (`management.health.db.enabled: false`), which waits the pool's full timeout while the database is down.
 */
@Component("dbHealthIndicator")
class DatabaseHealthIndicator(private val dataSource: DataSource) : TimeBoxedHealthIndicator() {

    override fun check(builder: Health.Builder) {
        dataSource.connection.use { connection ->
            if (connection.isValid(DEFAULT_TIMEOUT.toSeconds().toInt())) builder.up() else builder.down()
            builder
                .withDetail("database", connection.metaData.databaseProductName)
                .withDetail("validationQuery", "isValid()")
        }
    }
}
