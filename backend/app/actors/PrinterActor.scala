package actors

import java.awt.print.PrinterJob
import javax.print.PrintServiceLookup
import javax.print.attribute.HashPrintRequestAttributeSet
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested}
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit

import akka.actor._
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



class PrinterActor extends Actor {
  import actors.PrinterActor._

  Logger.debug("starting PrinterActor")
  var printService = PrintServiceLookup.lookupDefaultPrintService()
  var html = scala.io.Source.fromFile("templates/print1.html").mkString
  var aset = new HashPrintRequestAttributeSet
  aset.add(MediaSizeName.ISO_A6)
  aset.add(OrientationRequested.LANDSCAPE)

  def receive = {
    case Print(allMatchInfo) =>
      val newHtml = html
        .replaceAll("""\[name1\]""", allMatchInfo.player1.map(p => p.lastName + ", " + p.firstName).mkString(" / "))
        .replaceAll("""\[name2\]""", allMatchInfo.player2.map(p => p.lastName + ", " + p.firstName).mkString(" / "))
        .replaceAll("""\[club1\]""", allMatchInfo.player1.map(p => p.club.get.clubName).mkString(" / "))
        .replaceAll("""\[club2\]""", allMatchInfo.player2.map(p => p.club.get.clubName).mkString(" / "))
        .replaceAll("""\[id\]""", allMatchInfo.ttMatch.id.toString)
        .replaceAll("""\[type\]""", allMatchInfo.ttType.name)
        .replaceAll("""\[matchtype\]""", allMatchInfo.matchType.name)
      val editorPane = new JEditorPane()
      val htmlEditor = new HTMLEditorKit()
      editorPane.setEditorKit(htmlEditor)
      editorPane.setDocument(htmlEditor.createDefaultDocument())
      editorPane.setText(newHtml)
      editorPane.print(null, null, false, printService, aset, false)
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
