package de.ttt.management.settings.domain

interface PrinterGateway {
    fun listPrinters(): List<String>
}
