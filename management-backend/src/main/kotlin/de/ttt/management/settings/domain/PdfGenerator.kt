package de.ttt.management.settings.domain

interface PdfGenerator {
    fun generate(html: String): ByteArray
}
