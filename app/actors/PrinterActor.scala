package actors

import java.awt.print.PrinterJob

import akka.actor._
import controllers.AssetsFinder
import it.innove.play.pdf.PdfGenerator
import javax.inject.Inject
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested, PageRanges}
import javax.print.attribute.{HashDocAttributeSet, HashPrintRequestAttributeSet}
import javax.print.{PrintService, PrintServiceLookup}
import models.AllMatchInfo
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.printing.PDFPageable
import play.api.{Environment, Logger}



object PrinterActor {
  def props: Props = Props[PrinterActor]

  case class Print(allMatchInfo: AllMatchInfo)
  case class GetPrinterList()
  case class SetPrinter(name: String)
  case class GetPrinter()

  sealed trait PrinterAnswer
  case object PrinterNotFound extends PrinterAnswer
  case object PrinterFound extends PrinterAnswer
}



class PrinterActor @Inject() (pdfGenerator: PdfGenerator, env: Environment, af: AssetsFinder) extends Actor {
  import actors.PrinterActor._

  Logger.debug("starting PrinterActor")
  var printService: PrintService = PrintServiceLookup.lookupDefaultPrintService()
  var aSet = new HashPrintRequestAttributeSet
  aSet.add(MediaSizeName.ISO_A6)
  aSet.add(OrientationRequested.LANDSCAPE)
  aSet.add(new PageRanges(1))
  var docSet = new HashDocAttributeSet()
  docSet.add(MediaSizeName.ISO_A6)


  def receive: PartialFunction[Any, Unit] = {
    case Print(allMatchInfo) =>
      Logger.debug("start printing")
      import java.io.ByteArrayInputStream


      val byteStream = pdfGenerator.toBytes(views.html.schiri(allMatchInfo), "http://localhost:9000/")
      Logger.debug("pdf created")
      val doc: PDDocument = PDDocument.load(new ByteArrayInputStream(byteStream))
      val printerJob = PrinterJob.getPrinterJob
      printerJob.setPrintService(printService)
      printerJob.setPageable(new PDFPageable(doc))
      printerJob.print(aSet)
      doc.close()
//      val documentToBePrinted = new SimpleDoc(new ByteArrayInputStream(byteStream), docType, docSet)
//      Logger.debug(printService.getSupportedDocFlavors.toSeq.map(_.getMediaSubtype).toString)
//      Logger.debug("start print job")
//      printJob.print(documentToBePrinted, aset)
//      Logger.debug("started")

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
          sender ! PrinterFound
        case _ => sender ! PrinterNotFound
      }

  }
}
