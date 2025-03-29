package services

import models.AllMatchInfo
import org.slf4j.LoggerFactory
import org.xhtmlrenderer.pdf.ITextRenderer
import play.api.Environment

import java.io.ByteArrayOutputStream
import javax.inject.{Inject, Singleton}
import scala.util.Try

@Singleton
class PDFService @Inject()(env: Environment) {
  private val log = LoggerFactory.getLogger(getClass)

  def generatePDF(allMatchInfo: AllMatchInfo): Either[String, Array[Byte]] = {
    Try {
      val html = views.html.schiri(allMatchInfo).toString()
      val os = new ByteArrayOutputStream()
      val renderer = new ITextRenderer()
      
      renderer.getSharedContext().setBaseURL("http://localhost:9000/")
      renderer.getSharedContext().setPrint(true)
      renderer.getSharedContext().setInteractive(false)
      
      renderer.setDocumentFromString(html)
      renderer.layout()
      renderer.createPDF(os, true)
      
      val pdf = os.toByteArray
      os.close()
      pdf
    }.toEither.left.map { error =>
      log.error("Error creating PDF", error)
      error.getMessage
    }
  }
}
