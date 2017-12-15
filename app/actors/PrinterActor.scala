package actors

import java.awt.print.PrinterJob
import javax.print.PrintServiceLookup
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit

import akka.actor._
import models.TTMatch
import play.api.Logger



object PrinterActor {
  def props = Props[PrinterActor]

  case class Print(name: String)
  case class GetPrinter()
  case class SetPrinter(name: String)

  sealed trait Answer
  case object PrinterNotFound extends Answer
  case object PrinterFound extends Answer
}



class PrinterActor extends Actor {
  import actors.PrinterActor._

  var printService = PrintServiceLookup.lookupDefaultPrintService()

  def receive = {
    case Print(name: String) =>
      val editorPane = new JEditorPane()
      val htmlEditor = new HTMLEditorKit()
      editorPane.setEditorKit(htmlEditor)
      editorPane.setDocument(htmlEditor.createDefaultDocument())
      editorPane.setText("<!DOCTYPE html>\n<html>\n<body>\n\n<h1>My First Heading</h1>\n\n<p>My first paragraph.</p>\n\n</body>\n</html>")
      editorPane.print(null, null, false, printService, null, false)
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
