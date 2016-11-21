package websocket

/**
  * Created by jonas on 20.11.16.
  */
import akka.actor._
import akka.contrib.pattern.DistributedPubSubExtension
import akka.contrib.pattern.DistributedPubSubMediator.Subscribe
import play.api.Logger



object WebSocketActor {
  def props(out: ActorRef) = Props(new WebSocketActor(out))

  case class TablesUpdated()
  case class MatchesUpdated()
  case class PlayerUpdated()
}



class WebSocketActor(out: ActorRef) extends Actor {
  import websocket.WebSocketActor._

  Logger.debug("subscribe...")
  val mediator = DistributedPubSubExtension.get(context.system).mediator
  val topic = "Triggers"
  mediator ! Subscribe(topic, self)

  def receive = {
    case msg: String =>
      Logger.info("I received your message: " + msg)
      out ! ("I received your message: " + msg)
    case TablesUpdated =>
      Logger.info("send TablesUpdated")
      out ! "TablesUpdated"
    case MatchesUpdated =>
      Logger.info("send MatchesUpdated")
      out ! "MatchesUpdated"
    case PlayerUpdated =>
      Logger.info("send PlayerUpdated")
      out ! "PlayerUpdated"
    case e => Logger.info("error: " + e.toString)
  }
}
