package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.Logger
import play.api.libs.json.{Json, Writes}
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future

/**
  * Created by jonas on 09.10.16.
  */
class TableController @Inject() (tables: Tables) extends Controller{

  import models.TableModel._

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
      ttTable,
      ttTable.matchId.map(id => getAllMatchInfo(tables.getMatch(id).get).get)
    )
  }

  def getAllTables = Action {
    val t = tables.allTTTables()
    val x = t.map(ttTable => getAllTableInfo(ttTable))
    val z = x.sortBy(_.ttTable.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getTable(id: Long) = Action {
    Ok(Json.toJson(tables.getTTTable(id)))
  }

  def freeTable(id: Long) = Action {
    tables.freeTTTable(id)
    Ok("OK")
  }

  def lockTable(id: Long) = Action {
    tables.lockTTTable(id)
    Ok("OK")
  }

  def unlockTable(id: Long) = Action {
    tables.unlockTTTable(id)
    Ok("OK")
  }
}
