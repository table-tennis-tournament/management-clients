package de.ttt.management.settings.infrastructure.printing

import de.ttt.management.settings.domain.PdfGenerator
import org.springframework.stereotype.Component
import org.xhtmlrenderer.pdf.ITextRenderer
import java.io.ByteArrayOutputStream

@Component
class FlyingSaucerPdfGenerator : PdfGenerator {

    override fun generate(html: String): ByteArray {
        val out = ByteArrayOutputStream()
        val renderer = ITextRenderer()
        renderer.setDocumentFromString(html)
        renderer.layout()
        renderer.createPDF(out)
        return out.toByteArray()
    }
}
