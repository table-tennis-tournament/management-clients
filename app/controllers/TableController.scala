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

  def getAllMatchInfo(ttMatch: TTMatch): Future[Option[AllMatchInfoTable]] = {
    val p1F = Future.sequence(ttMatch.player1Ids map {id => tables.getPlayer(id)})
    val p2F = Future.sequence(ttMatch.player2Ids map {id => tables.getPlayer(id)})
    val tF = tables.getTTTable(ttMatch.ttTableId)
    val mtF = tables.getMatchType(ttMatch.matchTypeId)
    val tyF = tables.getType(ttMatch.typeId)
    val gF = tables.getGroup(ttMatch.groupId)
    val pF = for {
      p1 <- p1F
      p2 <- p2F
      mt <- mtF
      ty <- tyF
      g <- gF
    } yield(p1, p2, mt.get, ty.get, g)
    pF map {p =>
      Some(AllMatchInfoTable(
        ttMatch,
        p._1.flatten,
        p._2.flatten,
        p._3,
        p._4,
        p._5
      ))
    }
  }

  def getAllTableInfo(ttTable: TTTable): Future[TableInfo] = {
    val mF = tables.getMatchOnTable(ttTable.id)
    mF flatMap { m =>
      val matchInfo = if(m.isDefined) {
        getAllMatchInfo(m.get)
      } else {
        Future.successful(None)
      }
      matchInfo map {mi =>
        TableInfo(
          ttTable,
          mi
        )
      }
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
      Logger.info("m: " + x.toString())
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

  def unlockTable(id: Long) = Action.async {
    tables.unlockTTTable(id) map { r =>
      if (r) Ok("OK")
      else NotFound("no Match on Table")
    }
  }
}
