package de.ttt.management.printer.infrastructure.web

import de.ttt.management.printer.PrinterService
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/printer")
class PrinterController(private val printerService: PrinterService) {

    @GetMapping("/all")
    fun getAllPrinters(): List<String> = printerService.getAllPrinters()

    @GetMapping("/set/{name}")
    fun setPrinter(@PathVariable name: String): ResponseEntity<Map<String, Any>> {
        val success = printerService.setSelectedPrinter(name)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Printer not found"))
        }
    }

    @GetMapping("/setprintonstart/{active}")
    fun setPrintOnStart(@PathVariable active: Boolean): Map<String, Any> {
        printerService.setPrintOnStart(active)
        return mapOf("success" to true)
    }

    @GetMapping("/print/{id}")
    fun print(@PathVariable id: Long): ResponseEntity<Map<String, Any>> {
        val success = printerService.printMatch(id)
        return if (success) {
            ResponseEntity.ok(mapOf("success" to true))
        } else {
            ResponseEntity.badRequest().body(mapOf("success" to false, "message" to "Match not found or error printing"))
        }
    }

    @PostMapping("/printAll")
    fun printAll(@RequestBody ids: List<Long>): Map<String, Any> = mapOf("success" to true)

    @GetMapping("/printpdf/{id}", produces = [MediaType.APPLICATION_PDF_VALUE])
    fun printPDF(@PathVariable id: Long): ResponseEntity<ByteArray> = ResponseEntity.ok(ByteArray(0))

    @GetMapping("/getQrCode/{content}", produces = [MediaType.IMAGE_PNG_VALUE])
    fun getQrCode(@PathVariable content: String): ResponseEntity<ByteArray> {
        val qrCode = printerService.getQrCode(content)
        return ResponseEntity.ok(qrCode)
    }
}
