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

  implicit val playerWrites = new Writes[Player] {
    def writes(player: Player) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "ttr" -> player.ttr,
      "sex" -> player.sex,
      "club" -> player.club
    )
  }

  implicit val playerDAOWrites = new Writes[PlayerDAO] {
    def writes(player: PlayerDAO) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "ttr" -> player.ttr,
      "sex" -> player.sex
      //"club" -> player.club
    )
  }

  implicit val ttTableWrites = new Writes[TTTable] {
    def writes(ttTable: TTTable) = Json.obj(
      "id" -> ttTable.id,
      "number" -> ttTable.tableNumber,
      "isLocked" -> ttTable.isLocked
    )
  }

  implicit val resultWrites = new Writes[(Int, Int)] {
    def writes(result: (Int, Int)) = Json.obj(
      "player1" -> result._1,
      "player2" -> result._2
    )
  }

  implicit val matchTypeWrites = new Writes[MatchType] {
    def writes(matchType: MatchType) = Json.obj(
      "id" -> matchType.id,
      "name" -> matchType.name
    )
  }

  implicit val typeWrites = new Writes[Type] {
    def writes(ttType: Type) = Json.obj(
      "id" -> ttType.id,
      "name" -> ttType.name,
      "kind" -> ttType.kind
    )
  }

  implicit val groupWrites = new Writes[Group] {
    def writes(group: Group) = Json.obj(
      "id" -> group.id,
      "name" -> group.name
    )
  }

  implicit val ttMatchWrites = new Writes[TTMatch] {
    def writes(ttMatch: TTMatch) = Json.obj(
      "id" -> ttMatch.id,
      "startTime" -> ttMatch.startTime,
      "isPlayed" -> ttMatch.isPlayed
      // "allowedTableGroups" -> ttMatch.allowedTableGroups,
      // "result" -> ttMatch.getResult
      // "colorId" -> ttMatch.colorId
    )
  }

  case class AllMatchInfo(
    ttMatch: TTMatch,
    player1: Seq[Player],
    player2: Seq[Player],
    matchType: MatchType,
    ttType: Type,
    group: Option[Group]
  )

  implicit val allMatchInfoWrites = new Writes[AllMatchInfo] {
    def writes(allMatchInfo: AllMatchInfo) = Json.obj(
      "match" -> allMatchInfo.ttMatch,
      "team1" -> allMatchInfo.player1,
      "team2" -> allMatchInfo.player2,
      "matchType" -> allMatchInfo.matchType,
      "type" -> allMatchInfo.ttType,
      "group" -> allMatchInfo.group
    )
  }

  case class TableInfo(
    ttTable: TTTable,
    ttMatch: Option[AllMatchInfo]
  )

  implicit val tableInfoWrites = new Writes[TableInfo] {
    def writes(tableInfo: TableInfo) = Json.obj(
      "table" -> tableInfo.ttTable,
      "matchinfo" -> tableInfo.ttMatch
    )
  }

  def getAllMatchInfo(ttMatch: TTMatch): Future[Option[AllMatchInfo]] = {
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
      Some(AllMatchInfo(
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
    tables.lockTTTable(id) map { r =>
      if (r) Ok("OK")
      else NotFound("no Match on Table")
    }
  }
}
