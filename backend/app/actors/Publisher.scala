package actors

import akka.actor._
import akka.cluster.pubsub.DistributedPubSub
import akka.cluster.pubsub.DistributedPubSubMediator.Publish
import org.slf4j.LoggerFactory
import play.api.Logger
import websocket.WebSocketActor.{UpdateMatchList, UpdateMatches, UpdateTable, UpdateTableManager}

object Publisher{
  def props: Props = Props[Publisher]()
}

class Publisher extends Actor {

  val log = LoggerFactory.getLogger("publisherLogger")

  // activate the extension
  log.debug("Publisher started")
  val mediator: ActorRef = DistributedPubSub(context.system).mediator

  def receive: PartialFunction[Any, Unit] = {
    case in =>
      log.info("Publisher received message: " + in.getClass.getCanonicalName)
      in match {
        case UpdateTable(_) => mediator ! Publish("UpdateTable", in)
        case UpdateMatches(_) => mediator ! Publish("UpdateTable", in)
        case UpdateMatchList(_) => mediator ! Publish("UpdateTable", in)
        case UpdateTableManager(_) => mediator ! Publish("UpdateTable", in)
        case _ => log.error("unknown message")
      }

  }
}
