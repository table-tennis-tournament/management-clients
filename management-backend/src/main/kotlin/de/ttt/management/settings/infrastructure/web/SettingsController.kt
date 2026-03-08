package de.ttt.management.settings.infrastructure.web

import de.ttt.management.registration.DisciplineColorData
import de.ttt.management.registration.DisciplineService
import de.ttt.management.settings.SettingsService
import de.ttt.management.settings.domain.Setting
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/settings")
@Tag(name = "Settings Management", description = "Operations for managing tournament settings and discipline color configurations")
class SettingsController(
    private val settingsService: SettingsService,
    private val disciplineService: DisciplineService
) {

    @GetMapping("/all")
    @Operation(summary = "Get all settings", description = "Retrieves all global tournament settings.")
    fun getAllSettings(): List<Setting> = settingsService.getAllSettings()

    @GetMapping("/typecolors")
    @Operation(summary = "Get all discipline colors", description = "Retrieves color configuration for all discipline types.")
    fun getAllTypeColors(): Map<Long, DisciplineColorData> = disciplineService.getAllTypeColors()

    @PostMapping("/typecolors/{typeId}")
    @Operation(summary = "Save discipline color", description = "Updates the color configuration for a specific discipline type.")
    fun saveTypeColor(
        @Parameter(description = "ID of the discipline type") @PathVariable typeId: Long,
        @RequestBody colorData: DisciplineColorData
    ): Map<String, Any> {
        val success = disciplineService.saveTypeColor(typeId, colorData.bgColor, colorData.textColor)
        return mapOf("success" to success)
    }

    @PutMapping("/typecolors")
    @Operation(summary = "Set bulk discipline colors", description = "Updates color configurations for multiple discipline types.")
    fun setBulkTypeColors(
        @RequestBody colors: Map<Long, DisciplineColorData>
    ): Map<String, Any> {
        val success = disciplineService.saveBulkTypeColors(colors)
        return mapOf("success" to success)
    }
}
