package de.ttt.management.settings.infrastructure.web

import de.ttt.management.settings.application.SettingsService
import de.ttt.management.settings.domain.Setting
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/settings")
@Tag(name = "Settings Management", description = "Operations for managing tournament settings")
class SettingsController(
    private val settingsService: SettingsService
) {

    @GetMapping("/all")
    @Operation(summary = "Get all settings", description = "Retrieves all global tournament settings.")
    fun getAllSettings(): List<Setting> = settingsService.getAllSettings()
}
