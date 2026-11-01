package de.ttt.management.settings.domain

interface SettingsRepository {
    fun findAll(): List<Setting>
    fun save(setting: Setting): Setting
}
