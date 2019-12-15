package actors

import akka.actor._
import akka.cluster.pubsub.DistributedPubSub
import akka.cluster.pubsub.DistributedPubSubMediator.Publish
import play.api.Logger
import websocket.WebSocketActor.{UpdateMatchList, UpdateMatches, UpdateTable, UpdateTableManager}

object Publisher{
  def props: Props = Props[Publisher]
}

class Publisher extends Actor {

  // activate the extension
  Logger.debug("Publisher started")
  val mediator: ActorRef = DistributedPubSub(context.system).mediator

  def receive: PartialFunction[Any, Unit] = {
    case in =>
      Logger.info("Publisher received message: " + in.getClass.getCanonicalName)
      in match {
        case UpdateTable(_) => mediator ! Publish("UpdateTable", in)
        case UpdateMatches(_) => mediator ! Publish("UpdateTable", in)
        case UpdateMatchList(_) => mediator ! Publish("UpdateTable", in)
        case UpdateTableManager(_) => mediator ! Publish("UpdateTable", in)
        case _ => Logger.error("unknown message")
      }

  }
}
