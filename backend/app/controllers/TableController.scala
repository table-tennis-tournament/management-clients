package controllers

import dao.Tables

import javax.inject.Inject
import models._
import org.slf4j.LoggerFactory
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

  val log = LoggerFactory.getLogger("tableControllerLogger")

  def getAllTables: Action[AnyContent] = Action {
    val t = tables.allTTTables()
    val x = t.map(ttTable => tables.getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    log.info("m: " + z.toString())
    Ok(Json.toJson(z))
  }

  def getFreeTables: Action[AnyContent] = Action {
    val t = tables.allTTTables().filter(t => t.matchId.isEmpty && !t.isLocked.getOrElse(false))
    val x = t.map(ttTable => tables.getAllTableInfo(ttTable))
    val z = x.sortBy(_.tableNumber)
    log.info("m: " + z.toString())
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
    val ids = tableManagerId match {
      case 1 => Seq(1,2,3,4,5)
      case 2 => Seq(6, 7, 8, 11, 12)
      case 3 => Seq(9, 10, 13, 14, 15)
      case 4 => Seq(16, 17, 18, 19, 20)
      case 5 => Seq(21, 22, 23, 24)
    }
    val tableManagerTables = tables.allTTTables()
      .filter(table => ids.contains(table.tableNumber))
    val tablesWithMatches = tableManagerTables.map(ttTable => tables.getTableManagerTableInfo(ttTable, tableManagerId)).sortBy(_.tableNumber)
    Ok(Json.toJson(tablesWithMatches));
  }

}
