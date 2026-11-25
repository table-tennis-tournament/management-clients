package de.ttt.management.settings.domain

interface QrCodeGenerator {
    fun generate(content: String): ByteArray
}
