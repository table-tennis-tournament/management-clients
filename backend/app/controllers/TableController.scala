package controllers

import dao.Tables
import javax.inject.Inject
import models._
import play.api.Logger
import play.api.libs.json._
import play.api.mvc._


/**
 * Created by jonas on 09.10.16.
 */
class TableController @Inject()(tables: Tables,
                                val controllerComponents: ControllerComponents) extends BaseController {

  import models.AnswerModel._
  import models.TableModel._

  def getAllTables: Action[AnyContent] = Action {
    val t = tables.allTTTables()
    val x = t.map(ttTable => tables.getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getFreeTables: Action[AnyContent] = Action {
    val t = tables.allTTTables().filter(t => t.matchId.isEmpty && !t.isLocked.getOrElse(false))
    val x = t.map(ttTable => tables.getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    Logger.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getTable(id: Long): Action[AnyContent] = Action {
    tables.getTTTable(id) match {
      case Some(ttTable) => Ok(Json.toJson(tables.getAllTableInfo(ttTable)))
      case _ => BadRequest(Json.toJson(Answer(successful = false, "table not found")))
    }
  }

  def lockTable(nr: Long): Action[AnyContent] = Action {
    tables.lockTTTable(nr)
    Ok(Json.toJson(Answer(successful = true, "table locked")))
  }

  def unlockTable(nr: Long): Action[AnyContent] = Action {
    tables.unlockTTTable(nr)
    Ok(Json.toJson(Answer(successful = true, "table unlocked")))
  }

  def getByTablemanager(tableManagerId: Long) = Action {
    val lowerBoundary = (tableManagerId - 1) * 5
    val upperBoundary = tableManagerId * 5
    val tableManagerTables = tables.allTTTables()
      .filter(table => table.tableNumber > lowerBoundary && table.tableNumber <= upperBoundary);
    val tablesWithMatches = tableManagerTables.map(ttTable => tables.getTableManagerTableInfo(ttTable, tableManagerId)).sortBy(_.tableNumber)
    Ok(Json.toJson(tablesWithMatches));
  }

}
