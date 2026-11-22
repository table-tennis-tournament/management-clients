package de.ttt.management.settings.application

import de.ttt.management.settings.domain.MatchPrintInfo
import de.ttt.management.settings.domain.MatchPrintRepository
import de.ttt.management.settings.domain.PdfGenerator
import de.ttt.management.settings.domain.PrinterGateway
import de.ttt.management.settings.domain.QrCodeGenerator
import de.ttt.management.tournament.MatchAssigned
import org.junit.jupiter.api.Test
import java.util.Optional
import kotlin.test.assertEquals

/** Print on assign (the Spring wiring and the referee sheet are covered by `PrinterResourceIT`). */
class PrinterServiceTest {

    private class Gateway(private val failing: Boolean) : PrinterGateway {
        val printed = mutableListOf<String>()
        override fun listPrinters() = listOf("PDF")
        override fun print(printerName: String, pdf: ByteArray): Boolean {
            if (failing) throw IllegalStateException("printer offline")
            printed += printerName
            return true
        }
    }

    private val match = MatchPrintInfo(1, "Herren", "A", "Gruppenspiel", 1, "3", listOf("Anna Berg"), listOf("Bernd Kurz"))

    private fun service(gateway: PrinterGateway) = PrinterService(
        gateway,
        object : QrCodeGenerator {
            override fun generate(content: String) = byteArrayOf(1)
        },
        object : PdfGenerator {
            override fun generate(html: String) = byteArrayOf(2)
        },
        object : MatchPrintRepository {
            override fun findById(id: Long) = Optional.ofNullable(match.takeIf { it.id == id })
        },
        "PDF"
    )

    @Test
    fun `assigning a match prints its referee sheet on the default printer`() {
        val gateway = Gateway(failing = false)

        service(gateway).onMatchAssigned(MatchAssigned(matchId = 1, tableId = 3))

        assertEquals(listOf("PDF"), gateway.printed)
    }

    @Test
    fun `a printer failure does not fail the assignment`() {
        service(Gateway(failing = true)).onMatchAssigned(MatchAssigned(matchId = 1, tableId = 3))
    }

    @Test
    fun `nothing is printed with print on assign switched off`() {
        val gateway = Gateway(failing = false)
        val service = service(gateway).apply { setPrintOnStart(false) }

        service.onMatchAssigned(MatchAssigned(matchId = 1, tableId = 3))

        assertEquals(emptyList(), gateway.printed)
    }
}
