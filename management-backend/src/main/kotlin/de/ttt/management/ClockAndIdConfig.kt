package de.ttt.management

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.util.IdGenerator
import org.springframework.util.JdkIdGenerator
import java.time.Clock

/**
 * The time source and the UUID source of the application. Code asks these beans instead of
 * calling `LocalDateTime.now()` or `UUID.randomUUID()`, so tests can replace both with
 * deterministic implementations.
 */
@Configuration(proxyBeanMethods = false)
class ClockAndIdConfig {

    @Bean
    fun clock(): Clock = Clock.systemDefaultZone()

    @Bean
    fun idGenerator(): IdGenerator = JdkIdGenerator()
}
