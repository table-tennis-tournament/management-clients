package actors

import java.awt.print.PrinterJob
import javax.print.PrintServiceLookup
import javax.print.attribute.HashPrintRequestAttributeSet
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested}
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit

import akka.actor._
import models.{AllMatchInfo, TTMatch}
import play.api.{Logger, Play}



object PrinterActor {
  def props = Props[PrinterActor]

  case class Print(allMatchInfo: AllMatchInfo)
  case class GetPrinter()
  case class SetPrinter(name: String)

  sealed trait PrinterAnswer
  case object PrinterNotFound extends PrinterAnswer
  case object PrinterFound extends PrinterAnswer
}



class PrinterActor extends Actor {
  import actors.PrinterActor._

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
    case GetPrinter =>
      val printers = PrintServiceLookup.lookupPrintServices(null, null).map(p => p.getName).toSeq
      sender() ! printers
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

import java.awt.Font
import java.awt.Graphics
import java.awt.print.PageFormat
import java.awt.print.Printable

object SchiriPrintable {
  val font = new Font(Font.SANS_SERIF, Font.PLAIN, 20)
}

class SchiriPrintable(ttMatch: String) extends Printable {
  override def print(g: Graphics, pageFormat: PageFormat, pageIndex: Int): Int = {
    if (pageIndex >= 2) return Printable.NO_SUCH_PAGE
    g.setFont(SchiriPrintable.font)
    g.drawString(ttMatch, 100, 100)
    Printable.PAGE_EXISTS
  }
}
