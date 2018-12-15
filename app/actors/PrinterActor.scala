package actors

import java.awt.print.{PageFormat, Pageable, PrinterJob}

import javax.inject.Inject
import javax.print.PrintServiceLookup
import javax.print.attribute.{Attribute, DocAttributeSet, HashDocAttributeSet, HashPrintRequestAttributeSet}
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested, PageRanges}
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit
import org.apache.pdfbox._
import akka.actor._
import controllers.AssetsFinder
import dao.Tables
import it.innove.play.pdf.PdfGenerator
import models.{AllMatchInfo, TTMatch}
import net.glxn.qrgen.QRCode
import org.apache.pdfbox.pdmodel.PDDocument
import org.apache.pdfbox.printing.PDFPageable
import org.xhtmlrenderer.simple.PDFRenderer
import play.api.{Environment, Logger}
import play.api.libs.Files
import play.api.libs.Files.{SingletonTemporaryFileCreator, TemporaryFile}



object PrinterActor {
  def props = Props[PrinterActor]

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
  var printService = PrintServiceLookup.lookupDefaultPrintService()
  var aset = new HashPrintRequestAttributeSet
  aset.add(MediaSizeName.ISO_A6)
  aset.add(OrientationRequested.LANDSCAPE)
  aset.add(new PageRanges(1))
  var docSet = new HashDocAttributeSet()
  docSet.add(MediaSizeName.ISO_A6)


  def receive = {
    case Print(allMatchInfo) =>
      Logger.debug("start printing")
      import javax.print.DocFlavor
      import javax.print.SimpleDoc
      import java.io.ByteArrayInputStream


      val docType = DocFlavor.INPUT_STREAM.AUTOSENSE

      val byteStream = pdfGenerator.toBytes(views.html.schiri(allMatchInfo), "http://localhost:9000/")
      Logger.debug("pdf created")
      val doc: PDDocument = PDDocument.load(new ByteArrayInputStream(byteStream))
      val printerJob = PrinterJob.getPrinterJob
      printerJob.setPrintService(printService)
      printerJob.setPageable(new PDFPageable(doc))
      printerJob.print(aset)
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
      sender() ! printService.getName
    case SetPrinter(name: String) =>
      val psO = PrintServiceLookup.lookupPrintServices(null, null).find(_.getName == name)
      psO match {
        case Some(ps) => {
          printService = ps
          sender ! PrinterFound
        }
        case _ => sender ! PrinterNotFound
      }

  }
}
