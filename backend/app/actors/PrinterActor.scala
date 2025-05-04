package actors

import org.apache.pekko.actor._
import controllers.AssetsFinder

import javax.inject.Inject
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested, PageRanges}
import javax.print.attribute.{HashDocAttributeSet, HashPrintRequestAttributeSet}
import javax.print.{PrintService, PrintServiceLookup}
import models.AllMatchInfo
import org.slf4j.LoggerFactory
import play.api.Environment
import services.{PDFService, PrinterService}
import scala.concurrent.ExecutionContext

object PrinterActor {
  def props: Props = Props[PrinterActor]()

  case class Print(allMatchInfo: AllMatchInfo)
  case class GetPrinterList()
  case class SetPrinter(name: String)
  case class GetPrinter()
  case class PrintToPDF(allMatchInfo: AllMatchInfo)
  case class PDFCreated(pdf: Array[Byte])
  case class PDFError(message: String)
  case class PrintResult(success: Boolean, message: String)

  sealed trait PrinterAnswer
  case object PrinterNotFound extends PrinterAnswer
  case object PrinterFound extends PrinterAnswer
}

class PrinterActor @Inject() (
    env: Environment,
    af: AssetsFinder,
    pdfService: PDFService,
    printerService: PrinterService
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
      val requester = sender()
      
      printerService.printPDF(allMatchInfo).foreach {
        case Right(message) => 
          log.debug(s"Printing successful: $message")
          if (requester != ActorRef.noSender) {
            requester ! PrintResult(success = true, message)
          }
        case Left(error) => 
          log.error(s"Printing failed: $error")
          if (requester != ActorRef.noSender) {
            requester ! PrintResult(success = false, error)
          }
      }

    case PrintToPDF(allMatchInfo) =>
      log.debug("Creating PDF using PDFService")
      pdfService.generatePDF(allMatchInfo) match {
        case Right(pdf) => sender() ! PDFCreated(pdf)
        case Left(error) => sender() ! PDFError(error)
      }

    case GetPrinterList =>
      sender() ! printerService.getPrinterList

    case GetPrinter =>
      // Using default printer name for now - could be enhanced to store current printer
      val currentPrinter = if(printService != null) printService.getName else ""
      sender() ! currentPrinter
      
    case SetPrinter(name: String) =>
      val result = printerService.setPrinter(name)
      if (result) {
        // Update the local reference to the printer service
        val printerOpt = PrintServiceLookup.lookupPrintServices(null, null).find(_.getName == name)
        printerOpt.foreach(ps => printService = ps)
      }
      sender() ! (if (result) PrinterFound else PrinterNotFound)
  }
}
