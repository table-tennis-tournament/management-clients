package de.ttt.management.health.infrastructure

import org.flywaydb.core.Flyway
import org.flywaydb.core.api.MigrationInfo
import org.flywaydb.core.api.MigrationState
import org.springframework.boot.health.contributor.Health
import org.springframework.stereotype.Component

/**
 * Readiness of the backend's own `mgmt_` tables: every Flyway migration of this version has been applied
 * and none has failed. A migration from a newer backend (a downgrade) is reported, but does not make the
 * backend unready: Flyway accepts it at startup too.
 */
@Component
class FlywayHealthIndicator(private val flyway: Flyway) : TimeBoxedHealthIndicator() {

    override fun check(builder: Health.Builder) {
        val info = flyway.info()
        val migrations = info.all().toList()
        val failed = migrations.filter { it.state.isFailed }
        val pending = migrations.filter { it.state == MigrationState.PENDING }
        val future = migrations.filter { it.state == MigrationState.FUTURE_SUCCESS }

        if (failed.isEmpty() && pending.isEmpty()) builder.up() else builder.down()
        builder
            .withDetail("currentVersion", info.current()?.version?.version ?: "none")
            .withDetail("applied", migrations.count { it.state.isApplied })
            .withDetail("pending", pending.map(::name))
            .withDetail("failed", failed.map(::name))
        if (future.isNotEmpty()) builder.withDetail("future", future.map(::name))
    }

    private fun name(migration: MigrationInfo) = "${migration.version?.version ?: "R"}__${migration.description}"
}
