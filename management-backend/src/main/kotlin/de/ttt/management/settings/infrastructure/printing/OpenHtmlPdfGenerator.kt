package de.ttt.management.settings.infrastructure.printing

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder
import de.ttt.management.settings.domain.PdfGenerator
import org.springframework.stereotype.Component
import java.io.ByteArrayOutputStream

@Component
class OpenHtmlPdfGenerator : PdfGenerator {

    override fun generate(html: String): ByteArray {
        val out = ByteArrayOutputStream()
        val builder = PdfRendererBuilder()
        builder.useFastMode()
        builder.withHtmlContent(html, null)
        builder.toStream(out)
        builder.run()
        return out.toByteArray()
    }
}
