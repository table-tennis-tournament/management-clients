package de.ttt.management.registration

import de.ttt.management.registration.application.PlayerService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.PublishedEvents
import org.springframework.test.context.ActiveProfiles

@ApplicationModuleTest
@ActiveProfiles("test")
class RegistrationModuleTest {

    @Autowired
    private lateinit var playerService: PlayerService

    @Test
    fun `registers a player and publishes a PlayerRegistered event`(events: PublishedEvents) {
        val player = playerService.registerPlayer(
            firstName = "John",
            lastName = "Doe",
            ttr = 1500,
            sex = "m",
            clubId = null
        )

        assertThat(player.id).isNotNull()
        assertThat(events.ofType(PlayerRegistered::class.java)).hasSize(1)
    }
}
