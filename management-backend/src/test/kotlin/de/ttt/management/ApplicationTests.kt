package de.ttt.management

import org.junit.jupiter.api.Test
import org.springframework.modulith.core.ApplicationModules
import org.springframework.modulith.docs.Documenter

class ApplicationTests {

    @Test
    fun verifyModularity() {
        val modules = ApplicationModules.of(ManagementBackendApplication::class.java)
        modules.verify()
        
        Documenter(modules)
            .writeModulesAsPlantUml()
            .writeIndividualModulesAsPlantUml()
    }
}
