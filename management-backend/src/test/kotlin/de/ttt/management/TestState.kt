package de.ttt.management

import de.ttt.management.settings.application.PrinterService
import de.ttt.management.tournament.application.MatchListService

/**
 * Puts the backend back into a known state (registered by [ResourceTestConfiguration]). Call [reset] in a
 * test's `@BeforeEach`: the database is shared by all integration tests, and the auto-start flag, print on
 * assign and the selected printer live in memory and survive between tests that share a Spring context.
 */
class TestState(
    private val db: DatabaseHelper,
    private val matchListService: MatchListService,
    private val printerService: PrinterService,
    private val printer: RecordingPrinterGateway
) {

    /** An empty database, the default settings and no print jobs. */
    fun reset() {
        db.clean()
        matchListService.setMatchListActive(false)
        printerService.clearSelectedPrinter()
        printerService.setPrintOnStart(true)
        printer.reset()
    }
}
