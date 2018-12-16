package controllers

import actors.PrinterActor.{GetPrinterList, Print}
import akka.actor.{ActorRef, ActorSystem}
import javax.inject._

import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json
import akka.pattern.ask
import akka.util.Timeout
import websocket.WebSocketActor._

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success, Try}
/**
  * Created by jonas on 10.10.16.
  */
class MatchController @Inject() (tables: Tables, @Named("publisher_actor") pub: ActorRef) extends Controller{
  implicit val timeout: Timeout = 5.seconds
  import models.MatchModel._
  import models.AnswerModel._

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = ttMatch.player1Ids map {id => tables.getPlayerTypes(tables.getPlayer(id))}
    val p2 = ttMatch.player2Ids map {id => tables.getPlayerTypes(tables.getPlayer(id))}
    val mt = tables.getMatchType(ttMatch.matchTypeId)
    val ty = tables.getType(ttMatch.typeId)
    val g = tables.getGroup(ttMatch.groupId)
    val pl = tables.isPlayable(ttMatch)
    val state = ttMatch.state
    val tn = tables.getTTTableFromMatchId(ttMatch.id)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g, pl, state, tn))
    else
      None
  }

  def freeMatches = Action { request =>
    Logger.info("freeMatches")
    val req = request.body.asJson
    req match {
      case Some(r) => {
        r.asOpt[Seq[Long]] match {
          case Some(ids) => {
            ids map { id =>
              tables.freeTTTable(id)
              tables.updateMatchState(Finished, id)
            }
            pub ! UpdateMatches(tables.allMatchesInfo)
            pub ! UpdateTable(tables.allTableInfo)
            tables.startNextMatch
            Ok(Json.toJson(Answer(true, "successful")).toString())
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }
  }

  def takeBackMatches = Action { request =>
    val req = request.body.asJson
    req match {
      case Some(r) => {
        r.asOpt[Seq[Long]] match {
          case Some(ids) => {
            ids map { id =>
              tables.takeBackTTTable(id)
              tables.updateMatchState(Open, id)
            }
            pub ! UpdateMatches(tables.allMatchesInfo)
            pub ! UpdateTable(tables.allTableInfo)
            tables.startNextMatch
            Ok(Json.toJson(Answer(true, "successful")))
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }
  }

  def getMatchesByType(typeId: Long) = Action {
    val matches = tables.allMatches()
    val m = matches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(m.filter(_.ttMatch.typeId == typeId).sortBy(_.ttMatch.id)))
  }

  def getAllMatches = Action {
    val matches = tables.allMatches()
    val x = matches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getOpenMatches  = Action {
    val matches = tables.allMatches()
    val openMatches = matches.filter(m => m.state ==  Open || m.state == InWaitingList)
    val x = openMatches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getPlayedMatches  = Action {
    val matches = tables.allMatches()
    val playedMatches = matches.filter(_.state == Finished)
    val x = playedMatches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getPlayedMatchesByTypeId(typeid: Long)  = Action {
    val matches = tables.allMatches()
    val playedMatches = matches.filter(_.state == Finished)
    val playedMatchesByType = playedMatches.filter(_.typeId == typeid)
    val x = playedMatchesByType.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getOpenMatchesByTypeId(typeid: Long)  = Action {
    val matches = tables.allMatches()
    val openMatches = matches.filter(m => m.state ==  Open || m.state == InWaitingList)
    val openMatchesByType = openMatches.filter(_.typeId == typeid)
    val x = openMatchesByType.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getMatch(id: Long) = Action {
    val ttMatch = tables.getMatch(id)
    val ami = if(ttMatch.isDefined) getAllMatchInfo(ttMatch.get) else None
    Ok(Json.toJson(ami))
  }

  def setResult(id: Long) = Action.async { request =>
    Logger.info(request.body.asJson.get.toString())
    val res = request.body.asJson
    if(res.isDefined) {
      val resultO = res.get.validate[Seq[Seq[Int]]]
      tables.setResult(id, resultO.get) map {res =>
        if(res) {
          tables.updateMatchState(Completed, id)
          pub ! UpdateMatches(tables.allMatchesInfo)
          pub ! UpdateTable(tables.allTableInfo)
          tables.startNextMatch
          Ok(Json.toJson(Answer(true, "set result")))
        } else BadRequest(Json.toJson(Answer(false, "error writing result to database")))
      }
    } else {
      Future.successful(BadRequest(Json.toJson(Answer(false, "wrong request format"))))
    }
  }

  def getTypes = Action {
    Ok(Json.toJson(tables.allTypes.sortBy(_.name)))
  }

  def getActiveTypes = Action {
    Ok(Json.toJson(tables.allTypes.filter(_.active).sortBy(_.name)))
  }

  def deleteMatch(id: Long) = Action {
    tables.deleteMatch(id)
    Ok(Json.toJson(Answer(true, "delete match")))
  }

  def setMatchToTable(tableName: Int, checkPlayable: Boolean = true, print: Boolean = true, secondTable: Boolean = false) = Action{ request =>
    request.body.asJson match {
      case Some(matchIdsJson) => {
        matchIdsJson.validate[Seq[Long]].asOpt match {
          case Some(matchIds) => {
            val table = tables.getTTTableFromName(tableName).get
            val tableId = table.id
            val matches = tables.allMatches()
            Logger.info("matches: " + matches.toString())
            val m = matchIds.map(id => matches.filter(_.id == id).head)
            Logger.info(checkPlayable.toString)
            val matchReady = !checkPlayable || m.forall(m => if (m.state == Open || m.state == InWaitingList) {
                (m.player1Ids ++ m.player2Ids).forall { p =>
                  val ml = matches.filter { ma =>
                    (ma.state == Callable || ma.state == OnTable) && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
                  }
                  ml.isEmpty // p is not playing
                }
              } else {
                false
              })
            val res = if (matchReady) {
              val result = matchIds map { matchId =>
                Logger.info("Set match to Table")
                Logger.info(tables.getMatchList.toString())
                Logger.info("matchId: " + matchId)
                val ml = tables.getMatchList
                tables.updateMatchState(Callable, matchId)
                ml.filter(_.matchId.contains(matchId)).headOption match {
                  case Some(mlItem) => {
                    Logger.info("delMatchList")
                    tables.delMatchListItem(mlItem.uuid.get, matchId)
                    tables.startMatch(matchId, table.id, print)
                  }
                  case _ => {
                    tables.startMatch(matchId, table.id, print)
                  }
                }
              }
              result.forall(x => x)
            } else {
              Logger.error("Match not ready" + m.toString())
              false
            }
            Logger.info("result: " + res.toString() + " " + table.toString + " " + m.toString())
            if(res) {
              pub ! UpdateMatches(tables.allMatchesInfo)
              pub ! UpdateTable(tables.allTableInfo)
              pub ! UpdateMatchList(tables.getAllMatchList)
              Ok(Json.toJson(Answer(true, "started match")))
            } else
              BadRequest(Json.toJson(Answer(false, "not all matches started")))
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }

  }

  def matchCalled(id: Long) = Action {
    tables.updateMatchState(OnTable, id)
    Ok("State updated")
  }

  def loadNewMatches = Action.async {
    tables.loadNewMatches() flatMap { n =>
      tables.updateDoublesSeq flatMap { b =>
        tables.updateClubList flatMap { d =>
          tables.updateMatchTypeList flatMap { e =>
            tables.updateTypesList flatMap { f =>
              tables.updateGroupsSeq flatMap { g =>
                tables.updatePlayerList map { i =>
                  val x = n && b && d && e && f && g && i
                  if(x) {
                    pub ! UpdateMatches(tables.allMatchesInfo)
                    Ok(Json.toJson(Answer(true, "load new matches")))
                  } else BadRequest(Json.toJson(Answer(false, "error loading new matches")))
                }
              }
            }
          }
        }
      }
    }
  }
}