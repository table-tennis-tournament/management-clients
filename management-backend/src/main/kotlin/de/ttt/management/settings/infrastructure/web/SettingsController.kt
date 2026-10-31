package de.ttt.management.settings.infrastructure.web

import de.ttt.management.settings.application.PrinterService
import de.ttt.management.tournament.AutoStartState
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/settings")
@Tag(name = "Settings Management", description = "Operations for managing system settings")
class SettingsController(
    private val printerService: PrinterService,
    private val autoStartState: AutoStartState
) {

    @GetMapping("/all")
    @Operation(summary = "Get all runtime settings", description = "Retrieves the runtime system settings (printer, print-on-start, auto-start).")
    fun getAllSettings(): List<RuntimeSetting> = listOf(
        RuntimeSetting("printerName", printerService.getSelectedPrinterName() ?: ""),
        RuntimeSetting("alwaysPrint", printerService.getPrintOnStart()),
        RuntimeSetting("autoStart", autoStartState.isAutoStartActive())
    )
}

data class RuntimeSetting(
    val key: String,
    val value: Any
)
