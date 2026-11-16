package de.ttt.management

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Primary
import org.springframework.util.IdGenerator
import java.time.Clock
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.UUID
import java.util.concurrent.atomic.AtomicLong

/**
 * Replaces the application's [Clock] and [IdGenerator] so that timestamps and UUIDs in
 * responses and events are known in advance and can be compared exactly.
 */
@TestConfiguration(proxyBeanMethods = false)
class DeterministicTestConfiguration {

    @Bean
    @Primary
    fun fixedClock(): Clock = FIXED_CLOCK

    @Bean
    @Primary
    fun sequentialIdGenerator() = SequentialIdGenerator()

    companion object {
        /** The test time zone, independent of the machine the tests run on. */
        val ZONE: ZoneId = ZoneId.of("Europe/Berlin")

        /** 2026-11-16 10:00 in [ZONE]. */
        val FIXED_CLOCK: Clock = Clock.fixed(Instant.parse("2026-11-16T09:00:00Z"), ZONE)

        /** The local time every match gets when it is assigned or started in a test. */
        val NOW: LocalDateTime = LocalDateTime.now(FIXED_CLOCK)
    }
}

/**
 * Hands out the UUIDs `00000000-0000-0000-0000-000000000001`, `…002`, … in order.
 * [DatabaseHelper.clean] restarts the sequence together with the database ids.
 */
class SequentialIdGenerator : IdGenerator {

    private val counter = AtomicLong()

    override fun generateId(): UUID = UUID(0, counter.incrementAndGet())

    fun reset() = counter.set(0)
}
