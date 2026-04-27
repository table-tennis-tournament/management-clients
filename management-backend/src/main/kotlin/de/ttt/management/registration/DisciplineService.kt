package de.ttt.management.registration

import de.ttt.management.registration.domain.discipline.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DisciplineService(
    private val disciplineRepository: DisciplineRepository,
    private val disciplineColorRepository: DisciplineColorRepository
) {

    fun getAllDisciplines(): List<Discipline> = disciplineRepository.findAll()

    fun getActiveDisciplines(): List<Discipline> = disciplineRepository.findAll().filter { it.active }

    fun getAllTypeColors(): Map<Long, DisciplineColorData> {
        return disciplineColorRepository.findAll().associate {
            it.discipline!!.id!! to DisciplineColorData(it.bgColor ?: "", it.textColor ?: "")
        }
    }

    @Transactional
    fun saveTypeColor(disciplineId: Long, bgColor: String, textColor: String): Boolean {
        val discipline = disciplineRepository.findById(disciplineId).orElse(null) ?: return false
        val existingColor = disciplineColorRepository.findByDisciplineId(disciplineId).orElse(null)
        
        val color = existingColor ?: DisciplineColor(
            discipline = discipline
        )
        color.bgColor = bgColor
        color.textColor = textColor
        disciplineColorRepository.save(color)
        return true
    }

    @Transactional
    fun saveBulkTypeColors(colors: Map<Long, DisciplineColorData>): Boolean {
        colors.forEach { (id, data) ->
            saveTypeColor(id, data.bgColor, data.textColor)
        }
        return true
    }
}

data class DisciplineColorData(
    val bgColor: String,
    val textColor: String
)
