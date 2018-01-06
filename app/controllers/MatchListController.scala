package controllers

import java.util.UUID
import javax.inject.Named

import akka.actor.ActorRef
import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import websocket.WebSocketActor.{MatchListActive, MatchListAdd, MatchListDelete, MatchListMove}

import scala.None
import scala.concurrent.Future

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables, @Named("publisher_actor") pub: ActorRef) extends Controller{

  import models.MatchModel._
  import models.AnswerModel._

  var isActiv = false

  def autoStart = Action {
    tables.startNextMatch
    Ok(Json.toJson(Answer(true, "started matches")))
  }

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = ttMatch.player1Ids map {id => tables.getPlayer(id)}
    val p2 = ttMatch.player2Ids map {id => tables.getPlayer(id)}
    val mt = tables.getMatchType(ttMatch.matchTypeId)
    val ty = tables.getType(ttMatch.typeId)
    val g = tables.getGroup(ttMatch.groupId)
    val pl = tables.isPlayable(ttMatch)
    val inML = tables.isInMatchList(ttMatch)
    val tn = tables.getTTTableFromMatchId(ttMatch.id)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g, pl, inML, tn))
    else
      None
  }

  def getAllMatchList = Action{
    val ml = tables.getMatchList
    val x = ml map {mlEntry =>
      val m = mlEntry.matchId.map(id => tables.getMatch(id)).filter(_.isDefined).map(_.get)
      val mi = m.map(m => getAllMatchInfo(m)).filter(_.isDefined).map(_.get)
      MatchListInfo(mlEntry, mi)
    }
    Ok(Json.toJson(x))
  }

  def addMatch = Action{ request =>
    val jsonO = request.body.asJson
    jsonO match {
      case Some(json) => {
        json.validate[MatchList].asOpt match {
          case Some(matchList) => {
            val filteredMatchList = matchList.copy(matchId = matchList.matchId.filter(id => !tables.getMatch(id).get.isPlayed && !tables.getMatch(id).get.isPlaying))
            Logger.info("addMatch")
            val newMLEntry = filteredMatchList.copy(uuid = Some(filteredMatchList.uuid.getOrElse(UUID.randomUUID())), matchId = filteredMatchList.matchId.filter(id => !tables.isInMatchList(tables.getMatch(id).get)))
            val ml = tables.getMatchList
            if (ml.filter(_.matchId == filteredMatchList.matchId).isEmpty) {
              val newML = ml map { mlEntry =>
                if (mlEntry.position >= filteredMatchList.position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
              }
              val newMLAdded = newML ++ Seq(newMLEntry)
              tables.setMatchList(newMLAdded)
              pub ! MatchListAdd
              tables.startNextMatch
              Ok(Json.toJson(Answer(true, "match added", newMLEntry.uuid)))
            } else {
              BadRequest(Json.toJson(Answer(false, "match is already in match list", newMLEntry.uuid)))
            }
          }
          case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
        }
      }
      case _ => BadRequest(Json.toJson(Answer(false, "wrong request format")))
    }
  }

  def deleteMatch(uuid: String) = Action{
    Logger.info(tables.getMatchList.toString())
    Logger.info(uuid)
    if(tables.delMatchList(UUID.fromString(uuid))){
      pub ! MatchListDelete
      Ok(Json.toJson(Answer(true, "match deleted")))
    } else {
      BadRequest(Json.toJson(Answer(false, "UUID not found")))
    }

  }

  def getNext = Action {
    Ok("not implemented")
  }

  def setActive(isActive: Boolean) = Action {
    tables.autoStart = isActive
    pub ! MatchListActive
    Ok(Json.toJson(Answer(true,"set to " + isActive.toString)))
  }

  def isActive = Action {
    Ok(tables.autoStart.toString)
  }

  def move(uuid: String, pos: Int) = Action {
    val ml = tables.getMatchList
    ml.find(_.uuid == Some(UUID.fromString(uuid))) match {
      case Some(mlItem) => {
        val mlDel = ml.filter(_.position != mlItem.position) map { m =>
          if(m.position < mlItem.position) m
          else m.copy(position = m.position - 1)
        }
        val mlNew = mlDel map { m =>
          if(m.position < pos) m
          else m.copy(position = m.position + 1)
        }
        tables.setMatchList((mlNew :+ mlItem.copy(position = pos)).sortBy(_.position))
        pub ! MatchListMove
        Ok(Json.toJson(Answer(true, "changed match list")))
      }
      case _ => BadRequest(Json.toJson(Answer(false, "UUID not found")))
    }
  }
}
