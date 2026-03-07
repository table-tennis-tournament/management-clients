package de.ttt.management.settings.infrastructure.web

import de.ttt.management.registration.DisciplineColorData
import de.ttt.management.registration.DisciplineService
import de.ttt.management.settings.SettingsService
import de.ttt.management.settings.domain.Setting
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/settings")
class SettingsController(
    private val settingsService: SettingsService,
    private val disciplineService: DisciplineService
) {

    @GetMapping("/all")
    fun getAllSettings(): List<Setting> = settingsService.getAllSettings()

    @GetMapping("/typecolors")
    fun getAllTypeColors(): Map<Long, DisciplineColorData> = disciplineService.getAllTypeColors()

    @PostMapping("/typecolors/{typeId}")
    fun saveTypeColor(
        @PathVariable typeId: Long,
        @RequestBody colorData: DisciplineColorData
    ): Map<String, Any> {
        val success = disciplineService.saveTypeColor(typeId, colorData.bgColor, colorData.textColor)
        return mapOf("success" to success)
    }

    @PutMapping("/typecolors")
    fun setBulkTypeColors(@RequestBody colors: Map<Long, DisciplineColorData>): Map<String, Any> {
        val success = disciplineService.saveBulkTypeColors(colors)
        return mapOf("success" to success)
    }
}
