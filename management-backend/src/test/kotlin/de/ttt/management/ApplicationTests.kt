package de.ttt.management

import org.junit.jupiter.api.Test
import org.springframework.modulith.core.ApplicationModules

class ApplicationTests {

    @Test
    fun `verify modular structure`() {
        ApplicationModules.of(ManagementBackendApplication::class.java).verify()
    }
}
