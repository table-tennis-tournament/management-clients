package de.ttt.management.registration.domain.discipline

import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/disciplines")
class DisciplineController(private val disciplineService: DisciplineService) {

    @GetMapping
    fun getAllDisciplines(): List<Discipline> = disciplineService.getAllDisciplines()

    @GetMapping("/active")
    fun getActiveDisciplines(): List<Discipline> = disciplineService.getActiveDisciplines()

    @GetMapping("/colors")
    fun getAllTypeColors(): Map<Long, DisciplineColorData> = disciplineService.getAllTypeColors()

    @PostMapping("/{id}/color")
    fun saveTypeColor(
        @PathVariable id: Long,
        @RequestBody colorData: DisciplineColorData
    ): Map<String, Any> {
        val success = disciplineService.saveTypeColor(id, colorData.bgColor, colorData.textColor)
        return mapOf("success" to success)
    }
}
