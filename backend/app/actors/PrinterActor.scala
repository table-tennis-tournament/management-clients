package actors

import java.awt.print.PrinterJob
import org.apache.pekko.actor._
import controllers.AssetsFinder

import javax.inject.Inject
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested, PageRanges}
import javax.print.attribute.{HashDocAttributeSet, HashPrintRequestAttributeSet}
import javax.print.{PrintService, PrintServiceLookup}
import models.AllMatchInfo
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.printing.PDFPageable
import org.slf4j.LoggerFactory
import play.api.{Environment, Logger}
import play.twirl.api.Html
import org.xhtmlrenderer.pdf.ITextRenderer
import java.io.{ByteArrayOutputStream, ByteArrayInputStream}
import play.api.mvc.RequestHeader
import play.api.libs.ws.WSClient
import scala.concurrent.ExecutionContext
import javax.inject.Singleton
import play.api.http.HttpEntity
import scala.concurrent.duration._
import com.lowagie.text.PageSize
import com.lowagie.text.pdf.PdfWriter
import services.PDFService


object PrinterActor {
  def props: Props = Props[PrinterActor]()

  case class Print(allMatchInfo: AllMatchInfo)
  case class GetPrinterList()
  case class SetPrinter(name: String)
  case class GetPrinter()
  case class PrintToPDF(allMatchInfo: AllMatchInfo)
  case class PDFCreated(pdf: Array[Byte])
  case class PDFError(message: String)

  sealed trait PrinterAnswer
  case object PrinterNotFound extends PrinterAnswer
  case object PrinterFound extends PrinterAnswer
}



class PrinterActor @Inject() (
    env: Environment, 
    af: AssetsFinder,
    pdfService: PDFService
)(implicit ec: ExecutionContext) extends Actor {
  import actors.PrinterActor._

  val log = LoggerFactory.getLogger("printerLogger")

  log.debug("starting PrinterActor")
  var printService: PrintService = PrintServiceLookup.lookupDefaultPrintService()
  var aSet = new HashPrintRequestAttributeSet
  aSet.add(MediaSizeName.ISO_A6)
  aSet.add(OrientationRequested.LANDSCAPE)
  aSet.add(new PageRanges(1))
  var docSet = new HashDocAttributeSet()
  docSet.add(MediaSizeName.ISO_A6)


  def receive: PartialFunction[Any, Unit] = {
    case Print(allMatchInfo) =>
      log.debug("start printing")
      import java.io.ByteArrayInputStream


      // val byteStream = pdfGenerator.toBytes(views.html.schiri(allMatchInfo), "http://localhost:9000/")
      log.debug("pdf created")
      // val doc: PDDocument = PDDocument.load(new ByteArrayInputStream(byteStream))
      // val printerJob = PrinterJob.getPrinterJob
      // printerJob.setPrintService(printService)
      // printerJob.setPageable(new PDFPageable(doc))
      // printerJob.print(aSet)
      // doc.close()
//      val documentToBePrinted = new SimpleDoc(new ByteArrayInputStream(byteStream), docType, docSet)
//      Logger.debug(printService.getSupportedDocFlavors.toSeq.map(_.getMediaSubtype).toString)
//      Logger.debug("start print job")
//      printJob.print(documentToBePrinted, aset)
//      Logger.debug("started")

    case PrintToPDF(allMatchInfo) =>
      log.debug("Creating PDF using PDFService")
      pdfService.generatePDF(allMatchInfo) match {
        case Right(pdf) => sender() ! PDFCreated(pdf)
        case Left(error) => sender() ! PDFError(error)
      }

    case GetPrinterList =>
      val printers = PrintServiceLookup.lookupPrintServices(null, null).map(p => p.getName).toSeq
      sender() ! printers
    case GetPrinter =>
      sender() ! (if(printService != null) printService.getName else "")
    case SetPrinter(name: String) =>
      val psO = PrintServiceLookup.lookupPrintServices(null, null).find(_.getName == name)
      psO match {
        case Some(ps) =>
          printService = ps
          sender() ! PrinterFound
        case _ => sender() ! PrinterNotFound
      }

  }
}
