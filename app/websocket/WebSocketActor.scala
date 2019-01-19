package websocket

/**
  * Created by jonas on 20.11.16.
  */
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
  case class UpdateMatchList(matchList: Seq[MatchListInfo]) extends Message
}



class WebSocketActor(out: ActorRef) extends Actor {
  import models.MatchModel.{allMatchInfoWrites, matchListInfoWrites}
  import models.TableModel.tableInfoWrites
  import websocket.WebSocketActor._

  Logger.info("subscribe...")
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
      "UpdateMatches" -> updateMatches.matches
    )
  }

  implicit val updateMatchList = new Writes[UpdateMatchList] {
    def writes(updateMatchList: UpdateMatchList) = Json.obj(
      "UpdateMatchList" -> updateMatchList.matchList
    )
  }

  def receive = {
    case msg: String =>
      Logger.info("I received your message: " + msg)
      out ! ("I received your message: " + msg)
    case m: UpdateTable =>
      Logger.info("send UpdateTable)")
      out ! Json.toJson(m).toString()
    case m: UpdateMatches =>
      Logger.info("send UpdateMatches)")
      out ! Json.toJson(m).toString()
    case m: UpdateMatchList =>
      Logger.info("send UpdateMatchList)")
      out ! Json.toJson(m).toString()
    case SubscribeAck(Subscribe("Websocket", None, `self`)) ⇒
      Logger.info("subscribing")
    case e => Logger.info("error: " + e.toString)
  }
}
