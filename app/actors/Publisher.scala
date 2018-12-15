package actors

import java.awt.print.PrinterJob
import javax.print.PrintServiceLookup
import javax.print.attribute.HashPrintRequestAttributeSet
import javax.print.attribute.standard.{MediaSizeName, OrientationRequested}
import javax.swing.JEditorPane
import javax.swing.text.html.HTMLEditorKit

import akka.actor._
import akka.cluster.pubsub.{DistributedPubSub, DistributedPubSubMediator}
import akka.cluster.pubsub.DistributedPubSubMediator.Publish
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
  val mediator = DistributedPubSub(context.system).mediator

  def receive = {
    case in =>
      Logger.info("Publisher received message: " + in.getClass.getCanonicalName)
      mediator ! Publish("Websocket", in)
  }
}
