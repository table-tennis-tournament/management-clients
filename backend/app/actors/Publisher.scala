package actors

import java.awt.print.PrinterJob
import javax.print.PrintServiceLookup
import javax.print.attribute.HashPrintRequestAttributeSet
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested}
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit

import akka.actor._
import akka.contrib.pattern.DistributedPubSubExtension
import akka.contrib.pattern.DistributedPubSubMediator.Publish
import models.{AllMatchInfo, TTMatch}
import play.api.Logger
import websocket.WebSocketActor.Message

object Publisher{
  def props = Props[Publisher]
}

class Publisher extends Actor {
  import actors.Publisher._

  // activate the extension
  Logger.debug("Publisher started")
  val mediator = DistributedPubSubExtension.get(context.system).mediator

  def receive = {
    case in =>
      Logger.debug("Publischer reseived message: " + in.getClass.getCanonicalName)
      mediator ! Publish("Websocket", in)
  }
}
