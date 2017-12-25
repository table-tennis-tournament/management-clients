package actors

import java.awt.print.PrinterJob
import javax.print.PrintServiceLookup
import javax.print.attribute.HashPrintRequestAttributeSet
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested}
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit

import akka.actor._
import com.google.inject.Inject
import com.google.inject.assistedinject.Assisted
import dao.Tables
import it.innove.play.pdf.PdfGenerator
import models.{AllMatchInfo, TTMatch}
import play.api.Logger



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



class PrinterActor @Inject() (pdfGenerator: PdfGenerator) extends Actor {
  import actors.PrinterActor._

  Logger.debug("starting PrinterActor")
  var printService = PrintServiceLookup.lookupDefaultPrintService()
  var html = scala.io.Source.fromFile("templates/print1.html").mkString
  var aset = new HashPrintRequestAttributeSet
  aset.add(MediaSizeName.ISO_A6)
  aset.add(OrientationRequested.LANDSCAPE)

  def receive = {
    case Print(allMatchInfo) =>
      Logger.debug("start printing")
      import javax.print.DocFlavor
      import javax.print.SimpleDoc
      import java.io.ByteArrayInputStream

      val docType = DocFlavor.INPUT_STREAM.AUTOSENSE

      //fetch documents to be printed)
      val printJob = printService.createPrintJob
      val byteStream = pdfGenerator.toBytes(views.html.schiri(allMatchInfo), "http://localhost:9000/")

      val documentToBePrinted = new SimpleDoc(new ByteArrayInputStream(byteStream), docType, null)
      printJob.print(documentToBePrinted, null)

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
