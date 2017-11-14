package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json

import scala.concurrent.duration._
import scala.concurrent.{Await, Future}
import scala.util.{Failure, Success, Try}
/**
  * Created by jonas on 10.10.16.
  */
class MatchController @Inject() (tables: Tables) extends Controller{
  import models.MatchFilter._
  import models.MatchModel._
  import models.AnswerModel._

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = ttMatch.player1Ids map {id => tables.getPlayer(id)}
    val p2 = ttMatch.player2Ids map {id => tables.getPlayer(id)}
    val mt = tables.getMatchType(ttMatch.matchTypeId)
    val ty = tables.getType(ttMatch.typeId)
    val g = tables.getGroup(ttMatch.groupId)
    val pl = tables.isPlayable(ttMatch)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g, pl))
    else
      None
  }

  def freeMatches = Action { request =>
    val req = request.body.asJson
    req match {
      case Some(r) => {
        r.asOpt[Seq[Long]] match {
          case Some(ids) => {
            ids map { id =>
              tables.freeTTTable(id)
            }
            Ok(Json.toJson(Answer(true, "successful")))
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
            }
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
    val openMatches = matches.filter(m => !m.isPlaying && !m.isPlayed)
    val x = openMatches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getPlayedMatches  = Action {
    val matches = tables.allMatches()
    val playedMatches = matches.filter(m => m.isPlayed && m.getResult.isEmpty)
    val x = playedMatches.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getPlayedMatchesByTypeId(typeid: Long)  = Action {
    val matches = tables.allMatches()
    val playedMatches = matches.filter(m => m.isPlayed && m.getResult.isEmpty)
    val playedMatchesByType = playedMatches.filter(_.typeId == typeid)
    val x = playedMatchesByType.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getOpenMatchesByTypeId(typeid: Long)  = Action {
    val matches = tables.allMatches()
    val openMatches = matches.filter(m => !m.isPlaying && !m.isPlayed)
    val openMatchesByType = openMatches.filter(_.typeId == typeid)
    val x = openMatchesByType.map(ttMatch => getAllMatchInfo(ttMatch)).filter(_.isDefined).map(_.get)
    Ok(Json.toJson(x.sortBy(_.ttMatch.id)))
  }

  def getMatch(id: Long) = Action {
    val ttMatch = tables.getMatch(id)
    val ami = if(ttMatch.isDefined) getAllMatchInfo(ttMatch.get) else None
    Ok(Json.toJson(ami))
  }

  def setResult(id: Long) = Action { request =>
    Logger.info(request.body.asJson.get.toString())
    val res = request.body.asJson
    if(res.isDefined) {
      val resultO = res.get.validate[Seq[Seq[Int]]]
      val res2 = tables.setResult(id, resultO.get)
      Ok(res2.toString)
    } else {
      BadRequest("No JSON found")
    }
  }

//  def getFilteredMatchList = Action { request =>
//    val filterTypeList = request.body.asJson.get.as[Seq[MatchFilterType]]
//    tables.allMatches() map { matches =>
//      val filterList = filterTypeList map {ft => ft.filter}
//      val fMatches = filterList map {f =>
//        f.filterMatches(matches)
//      }
//      val res = fMatches.foldLeft(matches)((a, b) => a.intersect(b))
//      Ok(res.toString)
//    }
//  }

  def getTypes = Action {
    Ok(Json.toJson(tables.allTypes.sortBy(_.name)))
  }

  def getActiveTypes = Action {
    Ok(Json.toJson(tables.allTypes.filter(_.active).sortBy(_.name)))
  }

  def setMatchToTable(tableName: Int) = Action{ request =>
    request.body.asJson match {
      case Some(matchIdsJson) => {
        matchIdsJson.validate[Seq[Long]].asOpt match {
          case Some(matchIds) => {
            val table = tables.getTTTableFromName(tableName).get
            val matches = tables.allMatches()
            Logger.info("matches: " + matches.toString())
            val m = matchIds.map(id => matches.filter(_.id == id).head)
            val matchReady = m.forall(m => if (!(m.isPlayed || m.isPlaying)) {
                (m.player1Ids ++ m.player2Ids).forall { p =>
                  val ml = matches.filter { ma =>
                    ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
                  }
                  ml.isEmpty // p is not playing
                }
              } else {
                false
              })
            val res = if (matchReady) {
              matchIds.foreach { matchId =>
                Logger.info("Set match to Table")
                val ml = tables.getMatchList
                ml.filter(_.matchId == matchId).headOption match {
                  case Some(mlItem) => {
                    tables.delMatchList(mlItem.uuid.get)
                    m.foreach(m => tables.startMatch(m.id, table.id))
                  }
                  case _ => m.foreach(m => tables.startMatch(m.id, table.id))
                }
              }
            } else {
              Logger.error("Match not ready")
              Future.successful[Boolean](false)
            }
            Logger.info("result: " + res.toString() + " " + table.toString + " " + m.toString())
            Ok("{}")
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }

  }

  def loadNewMatches = Action.async {
    tables.loadNewMatches() map { n =>
      Ok(Json.toJson(Answer(true, "new matches: " + n.toString)))
    }
  }
}