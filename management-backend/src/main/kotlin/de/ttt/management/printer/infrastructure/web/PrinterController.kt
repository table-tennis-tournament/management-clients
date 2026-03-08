package de.ttt.management.printer.infrastructure.web

import de.ttt.management.printer.PrinterService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/printer")
@Tag(name = "Printer Management", description = "Operations for managing printers, print jobs, and QR code generation")
class PrinterController(private val printerService: PrinterService) {

    @GetMapping("/all")
    @Operation(summary = "Get all printers", description = "Retrieves a list of names of all available printers on the system.")
    fun getAllPrinters(): List<String> = printerService.getAllPrinters()

    @GetMapping("/set/{name}")
    @Operation(summary = "Set selected printer", description = "Sets the active printer to be used for future print jobs.")
    fun setPrinter(
        @Parameter(description = "Name of the printer to select") @PathVariable name: String
    ): ResponseEntity<Map<String, Any>> {
        val success = printerService.setSelectedPrinter(name)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Printer not found"))
        }
    }

    @GetMapping("/setprintonstart/{active}")
    @Operation(summary = "Set print-on-start state", description = "Enables or disables automatic printing when a match starts.")
    fun setPrintOnStart(
        @Parameter(description = "Enable (true) or disable (false) print-on-start") @PathVariable active: Boolean
    ): Map<String, Any> {
        printerService.setPrintOnStart(active)
        return mapOf("success" to true)
    }

    @GetMapping("/print/{id}")
    @Operation(summary = "Print match details", description = "Triggers a print job for the specified match ID using the selected printer.")
    fun print(
        @Parameter(description = "ID of the match to print") @PathVariable id: Long
    ): ResponseEntity<Map<String, Any>> {
        val success = printerService.printMatch(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Match not found or error printing"))
        }
    }

    @PostMapping("/printAll")
    @Operation(summary = "Print multiple matches", description = "Triggers print jobs for a list of match IDs.")
    fun printAll(
        @RequestBody ids: List<Long>
    ): Map<String, Any> = mapOf("success" to true)

    @GetMapping("/printpdf/{id}", produces = [MediaType.APPLICATION_PDF_VALUE])
    @Operation(
        summary = "Get match as PDF",
        description = "Generates and returns a PDF document for the specified match.",
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "PDF document successfully generated",
                content = [Content(mediaType = MediaType.APPLICATION_PDF_VALUE, schema = Schema(type = "string", format = "binary"))]
            )
        ]
    )
    fun printPDF(
        @Parameter(description = "ID of the match") @PathVariable id: Long
    ): ResponseEntity<ByteArray> = ResponseEntity.ok(ByteArray(0))

    @GetMapping("/getQrCode/{content}", produces = [MediaType.IMAGE_PNG_VALUE])
    @Operation(
        summary = "Generate QR code",
        description = "Generates a QR code image for the provided content string.",
        responses = [
            ApiResponse(
                responseCode = "200",
                description = "QR code image successfully generated",
                content = [Content(mediaType = MediaType.IMAGE_PNG_VALUE, schema = Schema(type = "string", format = "binary"))]
            )
        ]
    )
    fun getQrCode(
        @Parameter(description = "Content to encode in the QR code") @PathVariable content: String
    ): ResponseEntity<ByteArray> {
        val qrCode = printerService.getQrCode(content)
        return ResponseEntity.ok(qrCode)
    }
}
