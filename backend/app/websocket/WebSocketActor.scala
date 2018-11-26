package websocket

/**
  * Created by jonas on 20.11.16.
  */
import java.util.UUID

import akka.actor._
import akka.cluster.pubsub.DistributedPubSub
import akka.cluster.pubsub.DistributedPubSubMediator.{Subscribe, SubscribeAck}
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}


object WebSocketActor {
  def props(out: ActorRef) = Props(new WebSocketActor(out))

  trait Message

  case class UpdateTable(table: Seq[TableInfo]) extends Message
  case class UpdateMatches(matches: Seq[AllMatchInfo]) extends Message
  case class UpdateMatchList(matchList: Seq[MatchList]) extends Message
}



class WebSocketActor(out: ActorRef) extends Actor {
  import websocket.WebSocketActor._
  import models.WSMessageModel._
  import models.TableModel.tableInfoWrites
  import models.MatchModel.allMatchInfoWrites
  import models.MatchModel.matchListWrites

  Logger.debug("subscribe...")
  val mediator = DistributedPubSub(context.system).mediator
  val topic = "Websocket"
  mediator ! Subscribe(topic, self)

  implicit val updateTableWrites = new Writes[UpdateTable] {
    def writes(updateTable: UpdateTable) = Json.obj(
      "UpdateTable" -> updateTable.table
    )
  }

  implicit val updateMatchesWrites = new Writes[UpdateMatches] {
    def writes(updateMatches: UpdateMatches) = Json.obj(
      "UpdateTable" -> updateMatches.matches
    )
  }

  implicit val updateMatchList = new Writes[UpdateMatchList] {
    def writes(updateMatchList: UpdateMatchList) = Json.obj(
      "UpdateTable" -> updateMatchList.matchList
    )
  }

  def receive = {
    case msg: String =>
      Logger.info("I received your message: " + msg)
      out ! ("I received your message: " + msg)
    case m: UpdateTable =>
      Logger.debug("send UpdateTable)")
      out ! Json.toJson(m).toString()
    case m: UpdateMatches =>
      Logger.debug("send UpdateMatches)")
      out ! Json.toJson(m).toString()
    case m: UpdateMatchList =>
      Logger.debug("send UpdateMatchList)")
      out ! Json.toJson(m).toString()
    case SubscribeAck(Subscribe("Websocket", None, `self`)) ⇒
      Logger.debug("subscribing")
    case e => Logger.info("error: " + e.toString)
  }
}
