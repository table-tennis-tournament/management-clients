package de.ttt.management.settings.infrastructure.printing

import de.ttt.management.settings.domain.PrinterGateway
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.io.File

/**
 * Dispatches print jobs to a CUPS server (sidecar) via the `lpstat`/`lpr` command line.
 * The server is resolved through the standard `CUPS_SERVER` environment variable.
 */
@Component
class LprPrinterGateway : PrinterGateway {

    private val log = LoggerFactory.getLogger(LprPrinterGateway::class.java)

    override fun listPrinters(): List<String> {
        return try {
            run("lpstat", "-p")
                .lineSequence()
                .filter { it.startsWith("printer ") }
                .map { it.removePrefix("printer ").substringBefore(" ") }
                .toList()
        } catch (e: Exception) {
            log.warn("Failed to list printers", e)
            emptyList()
        }
    }

    override fun print(printerName: String, pdf: ByteArray): Boolean {
        val file = try {
            File.createTempFile("match-", ".pdf").apply { writeBytes(pdf) }
        } catch (e: Exception) {
            log.warn("Failed to write print job", e)
            return false
        }
        return try {
            run("lpr", "-P", printerName, "-o", "media=A6", file.absolutePath)
            true
        } catch (e: Exception) {
            log.warn("Failed to print on printer {}", printerName, e)
            false
        } finally {
            file.delete()
        }
    }

    private fun run(vararg cmd: String): String {
        val process = ProcessBuilder(*cmd).redirectErrorStream(true).start()
        val output = process.inputStream.bufferedReader().readText()
        val exit = process.waitFor()
        if (exit != 0) {
            throw IllegalStateException("Command '${cmd.joinToString(" ")}' exited with $exit: $output")
        }
        return output
    }
}
