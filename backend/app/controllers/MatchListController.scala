package controllers

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

  var isActiv = false

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfo] = {
    val p1 = ttMatch.player1Ids map {id => tables.getPlayer(id)}
    val p2 = ttMatch.player2Ids map {id => tables.getPlayer(id)}
    val mt = tables.getMatchType(ttMatch.matchTypeId)
    val ty = tables.getType(ttMatch.typeId)
    val g = tables.getGroup(ttMatch.groupId)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfo(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g))
    else
      None
  }

  def getAllMatchList = Action{
    val ml = tables.getMatchList
    val x = ml map {mlEntry =>
      val m = tables.getMatch(mlEntry.matchId)
      val mi = getAllMatchInfo(m.get)
      MatchListInfo(mlEntry, mi.get)
    }
    Ok(Json.toJson(x))
  }

  def addMatch(id: Long, position: Int) = Action{
    Logger.info("addMatch")
    val newMLEntry = MatchList(None, id, None, position)
    val ml = tables.getMatchList
    val newML = ml map {mlEntry =>
      if (mlEntry.position >= position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
    }
    val newMLAdded = newML ++ Seq(newMLEntry)
    tables.setMatchList(newMLAdded)
    val ml2 = tables.getMatchList
    Ok(Json.toJson(ml2.filter(_.matchId == id).headOption))
  }

  def addGroup(id: Long, position: Int) = Action{
    Logger.info("addGroup")
    val ml = tables.getMatchesInGroup(id)
    val addML = ml map { m =>
      MatchList(None, m.id, Some(id), position)
    }
    val oldML = tables.getMatchList
    val ml2 = oldML map { mlEntry =>
      if (mlEntry.position >= position) mlEntry.copy(position = mlEntry.position + 1) else mlEntry
    }
    tables.setMatchList(ml2 ++ addML)
    val ml3 = tables.getMatchList
    Ok(Json.toJson(ml3.filter(_.asGroup == Some(id))))
  }

  def deleteMatch(id: Long) = Action{
    val ml = tables.getMatchList
    val position = ml.filter(_.matchId == id).head.position
    val newML = ml map {mlEntry =>
      if (mlEntry.position > position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
    }
    tables.delMatchList(newML, ml.filter(_.matchId == id).head.id.get)
    Ok("deleted match")
  }

  def deleteGroup(id: Long) = Action {
    val ml = tables.getMatchList
    val position = ml.filter(_.asGroup.getOrElse(0) == id).head.position
    val newML = ml map {mlEntry =>
      if (mlEntry.position > position) mlEntry.copy(position = mlEntry.position - 1) else mlEntry
    }
    tables.delMatchListGroup(newML, id)
    Ok("deleted group")
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
