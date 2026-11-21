package de.ttt.management.health.infrastructure

import org.springframework.boot.health.contributor.Health
import org.springframework.boot.health.contributor.HealthIndicator
import java.time.Duration
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

/**
 * A health check that answers within [timeout]. A check that waits on the database would otherwise
 * hang for the connection pool's timeout (30 s) while the database is down, and the probe (Docker,
 * nginx's /readyz, 10 s) would see no answer instead of DOWN. Spring runs the indicators one after
 * another: the three database checks together take at most 6 s.
 *
 * The check runs on a virtual thread; one that runs over is reported DOWN and left to finish on its own.
 */
abstract class TimeBoxedHealthIndicator(private val timeout: Duration = DEFAULT_TIMEOUT) : HealthIndicator {

    /** Sets status and details on [builder]; an exception makes the result DOWN with the error. */
    protected abstract fun check(builder: Health.Builder)

    override fun health(): Health {
        val result = CompletableFuture.supplyAsync({
            runCatching { Health.Builder().also(::check).build() }.getOrElse { Health.down(it as? Exception ?: RuntimeException(it)).build() }
        }, executor)
        return try {
            result.get(timeout.toMillis(), TimeUnit.MILLISECONDS)
        } catch (_: TimeoutException) {
            Health.down().withDetail("error", "no answer within ${timeout.toMillis()} ms").build()
        }
    }

    companion object {
        val DEFAULT_TIMEOUT: Duration = Duration.ofSeconds(2)
        private val executor = Executors.newVirtualThreadPerTaskExecutor()
    }
}
