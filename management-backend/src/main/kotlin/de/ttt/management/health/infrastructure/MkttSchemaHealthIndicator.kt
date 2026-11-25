package de.ttt.management.health.infrastructure

import org.springframework.boot.health.contributor.Health
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Component

/**
 * Readiness of mktt's schema: every mktt table the backend reads or writes exists and the backend's
 * database user can read it. mktt owns these tables (ADR 0001), so they come from the loaded dump and
 * not from Flyway; a missing or misnamed dump shows up here and not first as a failing request.
 *
 * The row counts of matches, tables and players tell whether a tournament has been loaded. They are
 * details only: an empty tournament is still a valid database.
 */
@Component
class MkttSchemaHealthIndicator(private val jdbcClient: JdbcClient) : TimeBoxedHealthIndicator() {

    override fun check(builder: Health.Builder) {
        // a database that does not answer is an error, not eleven missing tables
        jdbcClient.sql("SELECT 1").query().singleValue()
        val missing = REQUIRED_TABLES.filterNot(::isReadable)
        if (missing.isNotEmpty()) {
            builder.down()
                .withDetail("missingTables", missing)
                .withDetail("requiredTables", REQUIRED_TABLES)
            return
        }
        builder.up()
            .withDetail("tables", REQUIRED_TABLES.size)
            .withDetail("rows", COUNTED_TABLES.associateWith(::count))
    }

    private fun isReadable(table: String): Boolean =
        runCatching { jdbcClient.sql("SELECT 1 FROM $table LIMIT 0").query().listOfRows() }.isSuccess

    private fun count(table: String): Long =
        jdbcClient.sql("SELECT COUNT(*) FROM $table").query(Long::class.java).single()

    companion object {
        /** The mktt tables the backend's SQL uses. Keep in step with the repositories. */
        val REQUIRED_TABLES = listOf(
            "club",
            "doubles",
            "matches",
            "matchtype",
            "player",
            "playerpergroup",
            "playgroups",
            "settings",
            "tables",
            "type",
            "typeperplayer",
        )

        private val COUNTED_TABLES = listOf("matches", "tables", "player")
    }
}
