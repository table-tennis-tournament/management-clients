package de.ttt.management.settings.domain

interface PrinterGateway {
    fun listPrinters(): List<String>
    fun print(printerName: String, pdf: ByteArray): Boolean
}
