package de.ttt.management.registration.infrastructure.web.discipline

import de.ttt.management.registration.DisciplineColorData
import de.ttt.management.registration.DisciplineService
import de.ttt.management.registration.domain.discipline.Discipline
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/disciplines")
@Tag(name = "Discipline Management", description = "Operations for managing tournament disciplines (e.g., Men's Singles, Women's Doubles)")
class DisciplineController(private val disciplineService: DisciplineService) {

    @GetMapping
    @Operation(summary = "Get all disciplines", description = "Retrieves a list of all disciplines defined in the tournament.")
    fun getAllDisciplines(): List<Discipline> = disciplineService.getAllDisciplines()

    @GetMapping("/active")
    @Operation(summary = "Get active disciplines", description = "Retrieves a list of disciplines that are currently active.")
    fun getActiveDisciplines(): List<Discipline> = disciplineService.getActiveDisciplines()

    @GetMapping("/colors")
    @Operation(summary = "Get all discipline colors", description = "Retrieves color configuration (background and text) for all disciplines.")
    fun getAllTypeColors(): Map<Long, DisciplineColorData> = disciplineService.getAllTypeColors()

    @PostMapping("/{id}/color")
    @Operation(summary = "Save discipline color", description = "Updates the color configuration for a specific discipline.")
    fun saveTypeColor(
        @Parameter(description = "ID of the discipline") @PathVariable id: Long,
        @RequestBody colorData: DisciplineColorData
    ): Map<String, Any> {
        val success = disciplineService.saveTypeColor(id, colorData.bgColor, colorData.textColor)
        return mapOf("success" to success)
    }

    @PutMapping("/colors")
    @Operation(summary = "Set bulk discipline colors", description = "Updates color configurations for multiple disciplines at once.")
    fun setBulkTypeColors(
        @RequestBody colors: Map<Long, DisciplineColorData>
    ): Map<String, Any> {
        val success = disciplineService.saveBulkTypeColors(colors)
        return mapOf("success" to success)
    }
}
