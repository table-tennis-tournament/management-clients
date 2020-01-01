package controllers

import akka.actor.ActorRef
import akka.util.Timeout
import dao.Tables
import javax.inject._
import models._
import org.joda.time.DateTime
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import websocket.WebSocketActor._

import scala.collection.immutable
import scala.concurrent.duration._
import scala.concurrent.{ExecutionContext, Future}

/**
 * Created by jonas on 10.10.16.
 */
class MatchController @Inject()(implicit ec: ExecutionContext,
                                tables: Tables,
                                @Named("publisher_actor") pub: ActorRef,
                                val controllerComponents: ControllerComponents) extends BaseController {
  implicit val timeout: Timeout = 5.seconds

  import models.AnswerModel._
  import models.MatchModel._
  import models.MatchState._

  def testSocket = Action {
    pub ! UpdateMatches(tables.allMatchesInfo)
    Ok("send")
  }

  def allMatchTable: Action[AnyContent] = Action.async {
    tables.allMatchTable.map(x => Ok(x.toString()))
  }

  def startMatch(matchId: Long, tableId: Long): Action[AnyContent] = Action.async {
    tables.startMatchOnTTTable(matchId, tableId)
    val t = tables.ttTablesSeq.filter(_.matchId.contains(matchId))
    val tableIds = t.map(_.id)
    tables.removeMatchFromOtherTables(matchId, tableId) map { res =>
      Logger.info("res: " + res)
      sendUpdateTableManagerMessagesForTables(tables.ttTablesSeq.filter(table => tableIds.contains(table.id)))
      pub ! UpdateTable(t.map(t =>tables.getAllTableInfo(t)))
      pub ! UpdateMatches(tables.allMatchesInfo.filter(_.ttMatch.id == matchId))
      Ok(Json.toJson(Answer(successful = true, "match started")))
    }
  }

  def stopMatch(matchId: Long): Action[AnyContent] = Action {
    tables.setMatchStateToOnTable(matchId)
    sendUpdateTableManagerMessages(matchId)
    Ok(Json.toJson(Answer(successful = true, "match on table")))
  }

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = ttMatch.player1Ids map { id => tables.getPlayerTypes(tables.getPlayer(id)) }
    val p2 = ttMatch.player2Ids map { id => tables.getPlayerTypes(tables.getPlayer(id)) }
    val mt = tables.getMatchType(ttMatch.matchTypeId)
    val ty = tables.getType(ttMatch.typeId)
    val g = tables.getGroup(ttMatch.groupId)
    val pl = tables.isPlayable(ttMatch)
    val state = ttMatch.state
    val tn = tables.getTTTableIdFromMatchId(ttMatch.id)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g, pl, state, tn))
    else
      None
  }

  def freeMatches: Action[AnyContent] = Action { request =>
    val req = request.body.asJson
    req match {
      case Some(r) =>
        r.asOpt[Seq[Long]] match {
          case Some(ids) =>
            setStateRemoveFromTableStartNextMatchAndSendMessages(ids, Finished)
            Ok(Json.toJson(Answer(successful = true, "successful")).toString())
          case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }
  }

  def takeBackMatches: Action[AnyContent] = Action { request =>
    val req = request.body.asJson
    req match {
      case Some(r) =>
        r.asOpt[Seq[Long]] match {
          case Some(ids) =>
            setStateRemoveFromTableStartNextMatchAndSendMessages(ids, Open)
            Ok(Json.toJson(Answer(successful = true, "successful")))
          case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }
  }

  def removeMatchesFromTable(tableId: Long): Action[AnyContent] = Action.async { request =>
    val req = request.body.asJson
    req match {
      case Some(r) =>
        r.asOpt[Seq[Long]] match {
          case Some(ids) =>
            val result = Future.sequence(ids.map(id => tables.removeMatchFromTable(id, tableId)))
            sendUpdateTableManagerMessagesForTables(tables.ttTablesSeq.filter(_.id == tableId))
            pub ! UpdateTable(tables.allTableInfo.filter(_.id == tableId))
            pub ! UpdateMatches(tables.allMatchesInfo.filter(m => ids.contains(m)))
            result.map(x => Ok(Json.toJson(Answer(successful = true, "successful"))))
          case _ => Future.successful(BadRequest(Json.toJson(Answer(successful = false, "wrong request format"))))
        }
      case _ => Future.successful(BadRequest(Json.toJson(Answer(successful = false, "wrong request format"))))
    }
  }

  private def setStateRemoveFromTableStartNextMatchAndSendMessages(ids: Seq[Long], matchState: MatchState): Unit = {
    val tableIdsToSendUpdate = tables.getTableInfoIdsForMatches(ids)
    tables.updateStateForMatchesAndRemoveFromTable(ids, matchState)
    pub ! UpdateMatches(tables.getAllMatchInfoForRelatedPlayers(ids))
    pub ! UpdateTable(tables.getTableInfosForIds(tableIdsToSendUpdate))
    tables.startNextMatch
    pub ! UpdateMatchList(tables.getAllMatchList)
  }

  def getMatchesByType(typeId: Long): Action[AnyContent] = Action {
    val matches = tables.allMatches()
    val m = matches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(m.filter(_.ttMatch.typeId == typeId).sortBy(_.ttMatch.id)))
  }

  def getAllMatches: Action[AnyContent] = Action {
    val matches = tables.allMatches()
    val x = matches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getOpenMatches: Action[AnyContent] = Action {
    val matches = tables.allMatches()
    val openMatches = matches.filter(m => m.state == Open || m.state == InWaitingList)
    val x = openMatches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }


  def getMatchAggregateNameFromMatch(head: TTMatch): String = {
    def fullMatch = getAllMatchInfo(head)

    if (fullMatch.isEmpty) return ""
    val completeMatch = fullMatch.get
    val resultString = completeMatch.matchType.name
    if (completeMatch.group.isDefined) {
      return resultString + " " + completeMatch.group.get.name
    }
    resultString
  }

  def getPlayersFromMatches(value: Seq[TTMatch]): Seq[Player] = {
    value.map(currentMatch => currentMatch.player1Ids ++ currentMatch.player2Ids).reduce((first, second) => first ++ second).distinct
      .map(id => tables.getPlayerTypes(tables.getPlayer(id)).get)
  }

  def getTableNumbersFromMatches(value: Seq[TTMatch]): Seq[Int] = {
    value.map(currentMatch => tables.getTTTableIdFromMatchId(currentMatch.id)).reduce((first, second) => first ++ second).distinct
  }

  implicit def dateTimeOrdering: Ordering[DateTime] = Ordering.fromLessThan(_ isBefore _)

  def distinctBy[A, B](xs: List[A])(f: A => B): List[A] =
    scala.reflect.internal.util.Collections.distinctBy(xs)(f)

  def getMatchAggregateForCaller: Action[AnyContent] = Action {
    Ok(Json.toJson(
      mapToMatchAggregate(tables.getCallableMatches)
        .sortBy(_.startTime))
    )
  }

  def getMatchAggregateForSecondCall:  Action[AnyContent] = Action {
    Ok(Json.toJson(
      mapToMatchAggregate(tables.getSecondCallMatches)
        .sortBy(_.startTime))
    )
  }

  def getMatchAggregateForThirdCall:  Action[AnyContent] = Action {
    Ok(Json.toJson(
      mapToMatchAggregate(tables.getThirdCallMatches)
        .sortBy(_.startTime))
    )
  }

  private def mapToMatchAggregate(callableMatches: Map[Long, Seq[(MatchTable, TTMatch)]]): immutable.Seq[MatchAggregate] = {
    val matchAggregates = callableMatches map {
      case (_, value) => MatchAggregate(getMatchAggregateNameFromMatch(value.head._2),
        value.head._2.startTime,
        getTableNumbersFromMatches(value.map(_._2)),
        tables.getType(value.head._2.typeId).get,
        getPlayersFromMatches(value.map(_._2)),
        value.map(x => getAllMatchInfo(x._2)).filter(_.isDefined).map(_.get)
      )
    }
    val matchAggregateList = distinctBy(matchAggregates.toList)(_.tableNumbers)
    matchAggregateList
  }

  def getPlayedMatches: Action[AnyContent] = Action {
    val matches = tables.allMatches()
    val playedMatches = matches.filter(_.state == Finished)
    val x = playedMatches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getPlayedMatchesByTypeId(typeid: Long): Action[AnyContent] = Action {
    val matches = tables.allMatches()
    val playedMatches = matches.filter(_.state == Finished)
    val playedMatchesByType = playedMatches.filter(_.typeId == typeid)
    val x = playedMatchesByType.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getOpenMatchesByTypeId(typeid: Long): Action[AnyContent] = Action {
    val matches = tables.allMatches()
    val openMatches = matches.filter(m => m.state == Open || m.state == InWaitingList)
    val openMatchesByType = openMatches.filter(_.typeId == typeid)
    val x = openMatchesByType.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getMatch(id: Long): Action[AnyContent] = Action {
    val ttMatch = tables.getMatch(id)
    val ami = if (ttMatch.isDefined) getAllMatchInfo(ttMatch.get) else None
    Ok(Json.toJson(ami))
  }

  def setResult(matchId: Long): Action[AnyContent] = Action.async { request =>
    val res = request.body.asJson
    if (res.isDefined) {
      val ttTables = tables.getTTTableFromMatchId(matchId)

      val resultO = res.get.validate[Seq[Seq[Int]]]
      tables.setResult(matchId, resultO.get) map { res => {
        if (res) {
          tables.startNextMatch
          pub ! UpdateTable(tables.getTableInfosForIds(ttTables.map(_.id)))
          pub ! UpdateMatches(tables.getAllMatchInfoForRelatedPlayers(List(matchId)))
          val newTables = ttTables.map(foundTable => tables.getTTTable(foundTable.id).get)
          sendUpdateTableManagerMessagesForTables(newTables)
          pub ! UpdateMatchList(tables.getAllMatchList)
          Ok(Json.toJson(Answer(successful = true, "set result")))
        } else BadRequest(Json.toJson(Answer(successful = false, "error writing result to database")))
      }
      }
    } else {
      Future.successful(BadRequest(Json.toJson(Answer(successful = false, "wrong request format"))))
    }
  }

  def updateResult(matchId: Long): Action[AnyContent] = Action { request =>
    val res = request.body.asJson
    if (res.isDefined) {
      val resultO = res.get.validate[Seq[Seq[Int]]]
      tables.setResultAndCompletedStateOnMatch(matchId, resultO.get, setCompleted = false)
      pub ! UpdateMatches(tables.allMatchesInfo.filter(_.ttMatch.id == matchId))
      sendUpdateTableManagerMessages(matchId)
      Ok(Json.toJson(Answer(successful = true, "updated match")))
    } else {
      BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }
  }

  private def sendUpdateTableManagerMessages(matchId: Long): Unit = {
    val ttTables = tables.getTTTableFromMatchId(matchId)
    sendUpdateTableManagerMessagesForTables(ttTables)
  }

  private def sendUpdateTableManagerMessagesForTables(ttTables: Seq[TTTable]): Unit = {
    pub ! UpdateTableManager(ttTables.map(table => tables.getTableManagerTableInfo(table, 1)))
  }

  def getTypes: Action[AnyContent] = Action {
    Ok(Json.toJson(tables.allTypes.map(addDoubleName).sortBy(_.name)))
  }

  def getActiveTypes: Action[AnyContent] = Action {
    Ok(Json.toJson(tables.allTypes.filter(_.active).map(addDoubleName).sortBy(_.name)))
  }

  private def addDoubleName(discipline: Type) = {
    if (discipline.kind == 2) discipline.copy(name = discipline.name + "-Doppel")
    else discipline
  }

  def deleteMatch(id: Long): Action[AnyContent] = Action {
    tables.deleteMatch(id)
    Ok(Json.toJson(Answer(successful = true, "delete match")))
  }

  def deleteType(id: Long): Action[AnyContent] = Action {
    tables.deleteType(id)
    Ok(Json.toJson(Answer(successful = true, "delete type")))
  }


  def setMatchToTable(tableName: Int, checkPlayable: Boolean = true, print: Boolean = true, secondTable: Boolean = false): Action[AnyContent] = Action { request =>
    request.body.asJson match {
      case Some(matchIdsJson) =>
        matchIdsJson.validate[Seq[Long]].asOpt match {
          case Some(matchIds) =>
            val table = tables.getTTTableFromName(tableName).get
            val matches = tables.allMatches()
            val m = matchIds.map(id => matches.filter(_.id == id).head)
            val matchReady = !checkPlayable || m.forall(m => if (m.state == Open || m.state == InWaitingList) {
              (m.player1Ids ++ m.player2Ids).forall { p =>
                val ml = matches.filter { ma =>
                  isBlocking(ma.state) && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
                }
                ml.isEmpty // p is not playing
              }
            } else {
              false
            })
            val res = if (matchReady) {
              val currentStartTime = new org.joda.time.DateTime()
              val result = matchIds.map { matchId =>
                val ml = tables.getMatchList
                tables.updateMatchState(Callable, List(matchId))
                tables.setStartTime(matchId, currentStartTime)
                ml.find(_.matchId.contains(matchId)) match {
                  case Some(mlItem) =>
                    tables.delMatchListItem(mlItem.uuid.get, matchId)
                    tables.startMatch(matchId, table.id, print)
                  case _ =>
                    tables.startMatch(matchId, table.id, print)
                }
              }

              pub ! UpdateTable(tables.allTableInfo.filter(_.id == table.id))
              pub ! UpdateMatches(tables.allMatchesInfo.filter(_.state != Completed))
              pub ! UpdateMatchList(tables.getAllMatchList)
              val newTable = tables.getTTTableFromName(tableName).get
              pub ! UpdateTableManager( Seq(tables.getTableManagerTableInfo(newTable, 1)))
              result.forall(x => x)
            } else {
              false
            }
            if (res) {
              Ok(Json.toJson(Answer(successful = true, "started match")))
            } else
              BadRequest(Json.toJson(Answer(successful = false, "not all matches started")))
          case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }

  }

  def callMatches: Action[AnyContent] = Action { request =>
    val req = request.body.asJson
    req match {
      case Some(r) =>
        r.asOpt[Seq[Long]] match {
          case Some(ids) =>
            ids foreach { id =>
              tables.updateMatchState(OnTable, id)
            }
            pub ! UpdateMatches(tables.allMatchesInfo.filter(_.state != Completed))
            Ok(Json.toJson(Answer(successful = true, "successful")).toString())
          case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
        }
      case _ => BadRequest(Json.toJson(Answer(successful = false, "wrong request format")))
    }
  }

  def callPlayers(matchId: Long): Action[AnyContent] = Action { request =>
    tables.updateCallStateForMatch(matchId)
    sendUpdateTableManagerMessagesForTables(tables.getTTTableFromMatchId(matchId))
    Ok(Json.toJson(Answer(successful = true, "Call Players success")))
  }

  def loadNewMatches: Action[AnyContent] = Action.async {
    tables.loadAllFromDB map { wasSuccessful =>
      if (wasSuccessful) {
        Ok(Json.toJson(Answer(successful = true, "load new matches")))
      } else BadRequest(Json.toJson(Answer(successful = false, "error loading new matches")))
    }
  }

}
