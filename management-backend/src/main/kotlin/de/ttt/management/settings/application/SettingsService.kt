package de.ttt.management.settings.application

import de.ttt.management.settings.domain.Setting
import de.ttt.management.settings.domain.SettingsRepository
import org.springframework.stereotype.Service

@Service
class SettingsService(private val settingsRepository: SettingsRepository) {

    fun getAllSettings(): List<Setting> = settingsRepository.findAll()
}
