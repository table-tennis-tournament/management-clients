package de.ttt.management.registration.domain.discipline

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
            it.discipline?.id!! to _root_ide_package_.de.ttt.management.registration.domain.discipline.DisciplineColorData(
                it.bgColor!!,
                it.textColor!!
            )
        }
    }

    @Transactional
    fun saveTypeColor(disciplineId: Long, bgColor: String, textColor: String): Boolean {
        val discipline = disciplineRepository.findById(disciplineId).orElse(null) ?: return false
        val existingColor = disciplineColorRepository.findAll().find { it.discipline?.id == disciplineId }
        
        val color = existingColor ?: _root_ide_package_.de.ttt.management.registration.domain.discipline.DisciplineColor(
            discipline = discipline
        )
        color.bgColor = bgColor
        color.textColor = textColor
        disciplineColorRepository.save(color)
        return true
    }
}

data class DisciplineColorData(
    val bgColor: String,
    val textColor: String
)
