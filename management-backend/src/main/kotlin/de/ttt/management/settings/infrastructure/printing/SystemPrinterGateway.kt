package de.ttt.management.settings.infrastructure.printing

import de.ttt.management.settings.domain.PrinterGateway
import org.springframework.stereotype.Component
import javax.print.PrintServiceLookup

@Component
class SystemPrinterGateway : PrinterGateway {

    override fun listPrinters(): List<String> =
        PrintServiceLookup.lookupPrintServices(null, null).map { it.name }
}
