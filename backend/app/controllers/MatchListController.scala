package controllers

import java.util.UUID

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.None
import scala.concurrent.Future

/**
  * Created by jonas on 24.11.16.
  */
class MatchListController @Inject() (tables: Tables) extends Controller{

  import models.MatchModel._
  import models.AnswerModel._

  var isActiv = false

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
            Logger.info("addMatch")
            val newMLEntry = matchList.copy(uuid = Some(matchList.uuid.getOrElse(UUID.randomUUID())))
            val ml = tables.getMatchList
            if (ml.filter(_.matchId == matchList.matchId).isEmpty) {
              val newML = ml map { mlEntry =>
                if (mlEntry.position >= matchList.position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
              }
              val newMLAdded = newML ++ Seq(newMLEntry)
              tables.setMatchList(newMLAdded)
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
      Ok(Json.toJson(Answer(true, "match deleted")))
    } else {
      BadRequest(Json.toJson(Answer(false, "UUID not found")))
    }

  }

  def getNext = Action {
    Ok("not implemented")
  }

  def setActive(isActive: Boolean) = Action {
    this.isActiv = isActive
    Ok("set to " + isActive.toString)
  }

  def isActive = Action {
    Ok(isActiv.toString)
  }
}
