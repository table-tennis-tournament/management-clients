package de.ttt.management.settings.application

import de.ttt.management.settings.domain.MatchPrintInfo
import de.ttt.management.settings.domain.MatchPrintRepository
import de.ttt.management.settings.domain.PdfGenerator
import de.ttt.management.settings.domain.PrinterGateway
import de.ttt.management.settings.domain.QrCodeGenerator
import org.springframework.stereotype.Service
import java.util.Base64

@Service
class PrinterService(
    private val printerGateway: PrinterGateway,
    private val qrCodeGenerator: QrCodeGenerator,
    private val pdfGenerator: PdfGenerator,
    private val matchPrintRepository: MatchPrintRepository
) {

    private var selectedPrinter: String? = null
    private var printOnStart: Boolean = false

    fun getAllPrinters(): List<String> = printerGateway.listPrinters()

    fun setSelectedPrinter(name: String): Boolean {
        val found = printerGateway.listPrinters().contains(name)
        if (found) {
            selectedPrinter = name
        }
        return found
    }

    fun setPrintOnStart(active: Boolean) {
        this.printOnStart = active
    }

    fun printMatch(matchId: Long): Boolean {
        println("Printing match $matchId on ${selectedPrinter ?: "default"}")
        return true
    }

    fun generateMatchPdf(matchId: Long): ByteArray? {
        val match = matchPrintRepository.findById(matchId).orElse(null) ?: return null
        val qr = qrCodeGenerator.generate(match.id.toString())
        return pdfGenerator.generate(refereeSheetHtml(match, qr))
    }

    fun getQrCode(content: String): ByteArray = qrCodeGenerator.generate(content)

    private fun refereeSheetHtml(match: MatchPrintInfo, qrPng: ByteArray): String {
        val qrDataUri = "data:image/png;base64," + Base64.getEncoder().encodeToString(qrPng)
        val player1 = match.player1Names.joinToString("<br/>") { it }
        val player2 = match.player2Names.joinToString("<br/>") { it }
        val group = match.groupName.orEmpty()
        val round = match.roundNumber?.toString().orEmpty()
        val table = match.tableNumber.orEmpty()
        val discipline = match.disciplineName.orEmpty()
        val matchType = match.matchTypeName.orEmpty()

        return """
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8"/>
            <style type="text/css">
                @page { size: 148mm 105mm; margin: 5mm; }
                body { font-family: sans-serif; margin: 0; padding: 0; }
                table.bordered, table.bordered th, table.bordered td { border: 1px solid black; }
                table { border-collapse: collapse; margin-bottom: 10px; }
                .full-width { width: 100%; }
                .first-column { width: 40%; }
                .set-column { width: 10%; }
                .thirty-percent { width: 30%; }
                .seventy-percent { width: 70%; }
                .cut-image { height: 20mm; width: 20mm; }
                td { padding: 1mm; height: 6mm; font-size: 8pt; }
                h2 { font-size: 10pt; margin: 1mm 0; }
                h3 { font-size: 9pt; margin: 1mm 0; }
            </style>
            </head>
            <body>
            <table class="full-width">
                <tr>
                    <td><h2>$discipline $group</h2><h3>$matchType $round</h3></td>
                    <td><img class="cut-image" src="$qrDataUri"/></td>
                    <td><h2>Nr. ${match.id}</h2><h3>Tisch: $table</h3></td>
                </tr>
            </table>
            <table class="full-width bordered">
                <thead>
                    <tr>
                        <td class="first-column">Spieler</td>
                        <td class="set-column">1. Satz</td>
                        <td class="set-column">2. Satz</td>
                        <td class="set-column">3. Satz</td>
                        <td class="set-column">4. Satz</td>
                        <td class="set-column">5. Satz</td>
                        <td>Ergebnis</td>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>$player1</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                    <tr><td>$player2</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
                </tbody>
            </table>
            <br/>
            <table class="full-width bordered">
                <tr><td class="thirty-percent">Sieger:</td><td class="seventy-percent"></td></tr>
            </table>
            </body>
            </html>
        """.trimIndent()
    }
}
