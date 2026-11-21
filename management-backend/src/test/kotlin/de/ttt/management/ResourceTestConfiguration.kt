package de.ttt.management

import de.ttt.management.settings.application.PrinterService
import de.ttt.management.tournament.application.MatchListService
import de.ttt.management.tournament.application.MatchService
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.test.web.servlet.client.RestTestClient

/**
 * The helpers of the REST integration tests: [Api], [TestState] and [Scenarios], next to the [DatabaseHelper],
 * the fixed clock and ids and the [RecordingPrinterGateway] of [DatabaseHelperConfiguration]. A test imports it
 * with `@Import(ResourceTestConfiguration::class)` and gets the helpers injected; every test class with the
 * same annotations shares one Spring context.
 */
@TestConfiguration(proxyBeanMethods = false)
@Import(DatabaseHelperConfiguration::class)
class ResourceTestConfiguration {

    @Bean
    fun api(restTestClient: RestTestClient) = Api(restTestClient)

    @Bean
    fun testState(
        db: DatabaseHelper,
        matchListService: MatchListService,
        printerService: PrinterService,
        printer: RecordingPrinterGateway
    ) = TestState(db, matchListService, printerService, printer)

    @Bean
    fun scenarios(
        db: DatabaseHelper,
        matchService: MatchService,
        matchListService: MatchListService,
        printer: RecordingPrinterGateway
    ) = Scenarios(db, matchService, matchListService, printer)
}
