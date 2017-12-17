package websocket

/**
  * Created by jonas on 20.11.16.
  */
import java.util.UUID

import akka.actor._
import akka.contrib.pattern.DistributedPubSubExtension
import akka.contrib.pattern.DistributedPubSubMediator.{Subscribe, SubscribeAck}
import models.WSMessage
import play.api.Logger
import play.api.libs.json.Json


object WebSocketActor {
  def props(out: ActorRef) = Props(new WebSocketActor(out))

  trait Message

  object MatchToTable extends Message
  object MatchResult extends Message
  object MatchLoadNew extends Message
  object MatchFree extends Message
  object MatchTakeBack extends Message
  object TableLock extends Message
  object TableUnlock extends Message
  object MatchListAdd extends Message
  object MatchListDelete extends Message
  object MatchListActive extends Message
  object MatchListMove extends Message
  object MatchUpdated extends Message
  object PlayerUpdated extends Message
}



class WebSocketActor(out: ActorRef) extends Actor {
  import websocket.WebSocketActor._
  import models.WSMessageModel._

  Logger.debug("subscribe...")
  val mediator = DistributedPubSubExtension.get(context.system).mediator
  val topic = "Websocket"
  mediator ! Subscribe(topic, self)

  def receive = {
    case msg: String =>
      Logger.info("I received your message: " + msg)
      out ! ("I received your message: " + msg)
    case m: Message =>
      Logger.debug("send " + m.getClass.getSimpleName.filter(_ != '$'))
      out ! Json.toJson(WSMessage(m.getClass.getSimpleName.filter(_ != '$'))).toString()
    case SubscribeAck(Subscribe("Websocket", None, `self`)) ⇒
      Logger.debug("subscribing")
    case e => Logger.info("error: " + e.toString)
  }
}
