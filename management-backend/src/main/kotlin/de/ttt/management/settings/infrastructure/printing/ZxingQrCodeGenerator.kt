package de.ttt.management.settings.infrastructure.printing

import com.google.zxing.BarcodeFormat
import com.google.zxing.client.j2se.MatrixToImageWriter
import com.google.zxing.qrcode.QRCodeWriter
import de.ttt.management.settings.domain.QrCodeGenerator
import org.springframework.stereotype.Component
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

@Component
class ZxingQrCodeGenerator : QrCodeGenerator {

    override fun generate(content: String): ByteArray {
        val matrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, 200, 200)
        val image = MatrixToImageWriter.toBufferedImage(matrix)
        val out = ByteArrayOutputStream()
        ImageIO.write(image, "png", out)
        return out.toByteArray()
    }
}
