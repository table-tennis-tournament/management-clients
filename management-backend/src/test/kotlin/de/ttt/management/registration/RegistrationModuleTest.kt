package de.ttt.management.registration

import de.ttt.management.DatabaseHelper
import de.ttt.management.DatabaseHelperConfiguration
import de.ttt.management.registration.application.PlayerService
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Import
import org.springframework.modulith.test.ApplicationModuleTest
import org.springframework.modulith.test.PublishedEvents
import org.springframework.test.context.ActiveProfiles

@ApplicationModuleTest
@ActiveProfiles("test")
@Import(DatabaseHelperConfiguration::class)
class RegistrationModuleTest {

    @Autowired
    private lateinit var playerService: PlayerService

    @Autowired
    private lateinit var db: DatabaseHelper

    @BeforeEach
    fun setup() {
        db.clean()
    }

    @Test
    fun `registers a player and publishes a PlayerRegistered event`(events: PublishedEvents) {
        val player = playerService.registerPlayer(
            firstName = "John",
            lastName = "Doe",
            ttr = 1500,
            sex = "m",
            clubId = null
        )

        // the player table is empty, so the new player gets the first id
        assertThat(player.id).isEqualTo(1L)
        assertThat(events.ofType(PlayerRegistered::class.java)).containsExactly(PlayerRegistered(1L, "John", "Doe"))
    }
}
