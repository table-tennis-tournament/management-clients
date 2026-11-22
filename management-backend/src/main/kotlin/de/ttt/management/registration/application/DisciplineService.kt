package de.ttt.management.registration.application

import de.ttt.management.registration.DisciplineColorsChanged
import de.ttt.management.registration.DisciplineShortNameChanged
import de.ttt.management.registration.domain.discipline.*
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DisciplineService(
    private val disciplineRepository: DisciplineRepository,
    private val disciplineColorRepository: DisciplineColorRepository,
    private val disciplineShortNameRepository: DisciplineShortNameRepository,
    private val eventPublisher: ApplicationEventPublisher
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
        val saved = persistTypeColor(disciplineId, bgColor, textColor)
        if (saved) {
            eventPublisher.publishEvent(DisciplineColorsChanged(listOf(disciplineId)))
        }
        return saved
    }

    private fun persistTypeColor(disciplineId: Long, bgColor: String, textColor: String): Boolean {
        if (!isStorableColor(bgColor) || !isStorableColor(textColor)) return false
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
        val saved = colors.filter { (id, data) -> persistTypeColor(id, data.bgColor, data.textColor) }.keys
        if (saved.isNotEmpty()) {
            eventPublisher.publishEvent(DisciplineColorsChanged(saved.toList()))
        }
        return true
    }

    fun getAllShortNames(): Map<Long, String> = disciplineShortNameRepository.findAll()

    /**
     * Sets the short name of a discipline; a blank [shortName] removes it, so the discipline is shown by its
     * full name again. Fails for an unknown discipline and for a name longer than [MAX_SHORT_NAME_LENGTH].
     */
    @Transactional
    fun saveShortName(disciplineId: Long, shortName: String?): Boolean {
        val trimmed = shortName?.trim().orEmpty()
        if (trimmed.length > MAX_SHORT_NAME_LENGTH) return false
        if (disciplineRepository.findById(disciplineId).isEmpty) return false
        if (trimmed.isEmpty()) {
            disciplineShortNameRepository.delete(disciplineId)
        } else {
            disciplineShortNameRepository.save(disciplineId, trimmed)
        }
        eventPublisher.publishEvent(DisciplineShortNameChanged(disciplineId))
        return true
    }

    companion object {
        /** The length `mgmt_type_short_name.tysn_short_name` holds. */
        const val MAX_SHORT_NAME_LENGTH = 30
    }
}

/** A CSS color the `mgmt_typecolors` columns can hold: a name like "white" or a hex color like "#ffffff". */
private fun isStorableColor(color: String) = color.isNotBlank() && color.length <= 7

data class DisciplineColorData(
    val bgColor: String,
    val textColor: String
)

data class DisciplineShortNameData(
    val shortName: String?
)
