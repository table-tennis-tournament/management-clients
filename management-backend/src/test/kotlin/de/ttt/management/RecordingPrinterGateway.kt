package de.ttt.management

import de.ttt.management.settings.domain.PrinterGateway

/**
 * Replaces the `lpr` gateway in the integration tests: nothing reaches a real printer, and tests can
 * check what was printed where. [PRINTERS] are the printers it reports.
 */
class RecordingPrinterGateway : PrinterGateway {

    /** One print job: the printer and the PDF. */
    data class Job(val printer: String, val pdf: ByteArray)

    private val jobs = mutableListOf<Job>()

    /** The print jobs since the last [reset], oldest first. */
    val printed: List<Job>
        @Synchronized get() = jobs.toList()

    @Synchronized
    fun reset() = jobs.clear()

    override fun listPrinters(): List<String> = PRINTERS

    @Synchronized
    override fun print(printerName: String, pdf: ByteArray): Boolean {
        jobs.add(Job(printerName, pdf))
        return true
    }

    companion object {
        val PRINTERS = listOf("PDF", "Office")
    }
}
