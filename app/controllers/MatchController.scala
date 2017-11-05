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
    Ok(Json.toJson(tables.allTypes))
  }

  def getActiveTypes = Action {
    Ok(Json.toJson(tables.allTypes.filter(_.active)))
  }

  def setGroupToTable(groupId: Long, tableName: Int) = Action{
    val table = tables.getTTTableFromName(tableName).get
    val matches = tables.allMatches()
    Logger.info("matches: " + matches.toString())
    val matchesInGroup = matches.filter(_.groupId.getOrElse(0) == groupId)
    val groupReady = matchesInGroup forall { m =>
      if (!(m.isPlayed || m.isPlaying)) {
        (m.player1Ids ++ m.player2Ids).forall { p =>
          val ml = matches.filter { ma =>
            ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
          }
          ml.isEmpty // p is not playing
        }
      } else {
        true
      }
    }
    val res = if (groupReady) {
      Logger.info("Set group to Table")
      val ml = tables.getMatchList
      val position = ml.filter(_.asGroup.getOrElse(0) == groupId).headOption.map(_.position)
      if(position.isDefined) {
        val newML = ml map { mlEntry =>
          if (mlEntry.position > position.get) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
        }
        tables.delMatchListGroup(newML, groupId)
        val a = matchesInGroup map { m =>
          tables.startMatch(m.id, table.id)
        }
        a
      } else {
        val started = matchesInGroup map { m =>
          tables.startMatch(m.id, table.id)
        }
        started
      }
    } else {
      Logger.error("Group not ready")
      Future.successful[Boolean](false)
    }
    Logger.info("result: " + res.toString() + " " + table.toString + " " + matchesInGroup.toString())
    Ok("{}")
  }

  def setMatchToTable(matchId: Long, tableName: Int) = Action{
    val table = tables.getTTTableFromName(tableName).get
    val matches = tables.allMatches()
    Logger.info("matches: " + matches.toString())
    val m = matches.filter(_.id == matchId).head
    val matchReady = if (!(m.isPlayed || m.isPlaying)) {
      (m.player1Ids ++ m.player2Ids).forall { p =>
        val ml = matches.filter { ma =>
          ma.isPlaying && (ma.player1Ids.contains(p) || ma.player2Ids.contains(p))
        }
        ml.isEmpty // p is not playing
      }
    } else {
      false
    }
    val res = if (matchReady) {
      Logger.info("Set match to Table")
      val ml = tables.getMatchList
      val position = ml.filter(_.matchId == matchId).headOption.map(_.position)
      if (position.isDefined) {
        val newML = ml map { mlEntry =>
          if (mlEntry.position > position.get) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
        }
        tables.delMatchList(newML, ml.filter(_.matchId == matchId).head.id.get)
        tables.startMatch(m.id, table.id)
      } else {
        tables.startMatch(m.id, table.id)
      }
    } else {
      Logger.error("Match not ready")
      Future.successful[Boolean](false)
    }
    Logger.info("result: " + res.toString() + " " + table.toString + " " + m.toString())
    Ok("{}")
  }

  def loadNewMatches = Action.async {
    tables.loadNewMatches() map { n =>
      Ok(Json.toJson(Answer(true, "new matches: " + n.toString)))
    }
  }
}