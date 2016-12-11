package controllers

import com.google.inject.Inject
import dao.Tables
import models.TTTable
import play.api.libs.json.{Json, Writes}
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext

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

  def getAllTables = Action.async {
    val ttTablesF = tables.allTTTables()
    ttTablesF.map {
      ttTables: Seq[TTTable] => Ok(Json.toJson(ttTables))
    }
  }

  def getTable(id: Long) = Action.async {
    val ttTablesF = tables.allTTTables()
    ttTablesF.map {
      ttTables: Seq[TTTable] => Ok(Json.toJson(ttTables.headOption))
    }
  }

  def freeTable(id: Long) = Action{Ok("not implemented")}

  def lockTable(id: Long) = Action{Ok("not implemented")}
}
