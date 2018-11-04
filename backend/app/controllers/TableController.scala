package controllers

import javax.inject.Named

import akka.actor.ActorRef
import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import websocket.WebSocketActor.{TableLock, TableUnlock}


/**
  * Created by jonas on 09.10.16.
  */
class TableController @Inject() (tables: Tables, @Named("publisher_actor") pub: ActorRef) extends Controller{

  import models.TableModel._
  import models.AnswerModel._

  def getAllMatchInfo(ttMatch: TTMatch): Option[AllMatchInfoTable] = {
    val p1 = ttMatch.player1Ids map {id => tables.getPlayer(id)}
    val p2 = ttMatch.player2Ids map {id => tables.getPlayer(id)}
    val mt = tables.getMatchType(ttMatch.matchTypeId)
    val ty = tables.getType(ttMatch.typeId)
    val g = tables.getGroup(ttMatch.groupId)
    if (mt.isDefined && ty.isDefined)
      Some(AllMatchInfoTable(ttMatch, p1.filter(_.isDefined).map(_.get), p2.filter(_.isDefined).map(_.get), mt.get, ty.get, g))
    else
      None
  }

  def getAllTableInfo(ttTable: TTTable): TableInfo = {
    TableInfo(
      ttTable.id,
      ttTable.tableNumber,
      ttTable.isLocked,
      ttTable.matchId.map(id => getAllMatchInfo(tables.getMatch(id).get).get)
    )
  }

  def getAllTables = Action {
    val t = tables.allTTTables()
    val x = t.map(ttTable => getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getFreeTables = Action {
    val t = tables.allTTTables().filter(t => t.matchId.isEmpty && !t.isLocked.getOrElse(false))
    val x = t.map(ttTable => getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getTable(id: Long) = Action {
    tables.getTTTable(id) match {
      case Some(ttTable) => Ok(Json.toJson(getAllTableInfo(ttTable)))
      case _ => BadRequest(Json.toJson(Answer(false, "table not found")))
    }
  }

  def lockTable(id: Long) = Action {
    tables.lockTTTable(id)
    pub ! TableLock
    Ok(Json.toJson(Answer(true, "table locked")))
  }

  def unlockTable(id: Long) = Action {
    tables.unlockTTTable(id)
    pub ! TableUnlock
    Ok(Json.toJson(Answer(true, "table unlocked")))
  }
}
