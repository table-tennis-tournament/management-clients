package controllers

import com.google.inject.Inject
import dao.Tables
import models.{MatchDAO, TTTable}
import play.api.libs.json.{Json, Writes}
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future

/**
  * Created by jonas on 09.10.16.
  */
class TableController @Inject() (tables: Tables) extends Controller{
  implicit val ttTableWrites = new Writes[TTTable] {
    def writes(ttTable: TTTable) = Json.obj(
      "id" -> ttTable.id,
      "number" -> ttTable.tableNumber,
      "isLocked" -> ttTable.isLocked
    )
  }

  implicit val ttMatchWrites = new Writes[MatchDAO] {
    def writes(ttMatch: MatchDAO) = Json.obj(
      "id" -> ttMatch.id,
      "startTime" -> ttMatch.startTime,
      "isPlayed" -> ttMatch.isPlayed,
      //"allowedTableGroups" -> ttMatch.allowedTableGroups,
      "result" -> ttMatch.getResult
      //"colorId" -> ttMatch.colorId
    )
  }

  case class TableInfo(
    ttTable: TTTable,
    ttMatch: Option[MatchDAO]
  )

  implicit val tableInfoWrites = new Writes[TableInfo] {
    def writes(tableInfo: TableInfo) = Json.obj(
      "table" -> tableInfo.ttTable,
      "match" -> tableInfo.ttMatch
    )
  }

  def getAllTableInfo(ttTable: TTTable): Future[TableInfo] = {
    val mF = tables.getMatchOnTable(ttTable.id)
    mF map { m =>
      TableInfo(
        ttTable,
        m
      )
    }
  }

  def getAllTables = Action.async {
    val tablesF = tables.allTTTables()
    val x = tablesF map {tables =>
      tables map(ttTable => getAllTableInfo(ttTable))
    }
    val z = x map {y => Future.sequence(y)}
    val z2 = z.flatMap(z => z)
    z2 map {z =>
      val x = z.sortBy(_.ttTable.tableNumber)
      Ok(Json.toJson(x))
    }
  }

  def getTable(id: Long) = Action.async {
    val ttTablesF = tables.allTTTables()
    ttTablesF.map {
      ttTables: Seq[TTTable] => Ok(Json.toJson(ttTables.headOption))
    }
  }

  def freeTable(id: Long) = Action.async {
    tables.freeTTTable(id) map {r =>
      if (r) Ok("OK")
      else NotFound("no Match on Table")
    }
  }

  def lockTable(id: Long) = Action.async {
    tables.lockTTTable(id) map { r =>
      if (r) Ok("OK")
      else NotFound("no Match on Table")
    }
  }
}
