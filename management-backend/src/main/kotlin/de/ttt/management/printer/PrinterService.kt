package de.ttt.management.printer

import de.ttt.management.tournament.TournamentService
import org.springframework.stereotype.Service
import java.util.*

@Service
class PrinterService(private val tournamentService: TournamentService) {

    private val printers = mutableListOf("TestPrinter", "Default")
    private var selectedPrinter: String? = null
    private var printOnStart: Boolean = false

    fun getAllPrinters(): List<String> = printers

    fun setSelectedPrinter(name: String): Boolean {
        if (printers.contains(name)) {
            selectedPrinter = name
            return true
        }
        return false
    }

    fun setPrintOnStart(active: Boolean) {
        this.printOnStart = active
    }

    fun printMatch(matchId: Long): Boolean {
        val match = tournamentService.getMatch(matchId) ?: return false
        println("Printing match $matchId on $selectedPrinter")
        return true
    }

    fun getQrCode(content: String): ByteArray {
        return Base64.getDecoder().decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==")
    }
}
