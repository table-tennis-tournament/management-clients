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
  def props(out: ActorRef, topic: String) = Props(new WebSocketActor(out, topic))

  trait Message

  case class UpdateTable(table: Seq[TableInfo]) extends Message
  case class UpdateMatches(matches: Seq[AllMatchInfo]) extends Message
  case class UpdateMatchList(matchList: Seq[MatchListInfo]) extends Message
  case class UpdateTableManager(table: Seq[TableManagerTableInfo]) extends Message
}



class WebSocketActor(out: ActorRef, topic: String) extends Actor {
  import models.MatchModel.{allMatchInfoWrites, matchListInfoWrites}
  import models.TableModel.tableInfoWrites
  import models.TableModel.tableManagerTableWrites
  import websocket.WebSocketActor._

  Logger.info("subscribe...")
  val mediator: ActorRef = DistributedPubSub(context.system).mediator

  Logger.info("subscribe topic: " + topic)
  mediator ! Subscribe(topic, self)
  Logger.info("subscribed")

  implicit val updateTableWrites: Writes[UpdateTable] = (updateTable: UpdateTable) => Json.obj(
    "UpdateTable" -> updateTable.table
  )

  implicit val updateMatchesWrites: Writes[UpdateMatches] = (updateMatches: UpdateMatches) => Json.obj(
    "UpdateMatches" -> updateMatches.matches
  )

  implicit val updateMatchList: Writes[UpdateMatchList] = (updateMatchList: UpdateMatchList) => Json.obj(
    "UpdateMatchList" -> updateMatchList.matchList
  )

  implicit val updateTableManagerWrites: Writes[UpdateTableManager] = (updateTablemanager: UpdateTableManager) => Json.obj(
    "UpdateTableManager" -> updateTablemanager.table
  )

  def receive: PartialFunction[Any, Unit] = {
    case msg: String =>
      Logger.info("I received your message: " + msg)
      out ! ("I received your message: " + msg)
    case m: UpdateTable =>
      Logger.info("send UpdateTable")
      out ! Json.toJson(m).toString()
    case m: UpdateMatches =>
      Logger.info("send UpdateMatches")
      out ! Json.toJson(m).toString()
    case m: UpdateMatchList =>
      Logger.info("send UpdateMatchList")
      out ! Json.toJson(m).toString()
    case m: UpdateTableManager =>
      Logger.info("send UpdateTableManager")
      out ! Json.toJson(m).toString()
    case SubscribeAck(Subscribe(topic, None, `self`)) ⇒
      Logger.info("subscribing " + topic)
    case e => Logger.info("error: " + e.toString)
  }
}
