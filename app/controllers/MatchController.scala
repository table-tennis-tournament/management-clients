package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext

import scala.concurrent.Future
/**
  * Created by jonas on 10.10.16.
  */
class MatchController @Inject() (tables: Tables) extends Controller{

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
      "name" -> ttType.name
    )
  }

  implicit val groupWrites = new Writes[Group] {
    def writes(group: Group) = Json.obj(
      "id" -> group.id,
      "name" -> group.name
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

  case class AllMatchInfo(
    ttMatch: MatchDAO,
    player1: Player,
    player2: Player,
    table: Option[TTTable],
    matchType: MatchType,
    ttType: Type,
    group: Option[Group]
  )

  implicit val allMatchInfoWrites = new Writes[AllMatchInfo] {
    def writes(allMatchInfo: AllMatchInfo) = Json.obj(
      "match" -> allMatchInfo.ttMatch,
      "player1" -> allMatchInfo.player1,
      "player2" -> allMatchInfo.player2,
      "table" -> allMatchInfo.table,
      "matchType" -> allMatchInfo.matchType,
      "type" -> allMatchInfo.ttType,
      "group" -> allMatchInfo.group
    )
  }

  def getAllMatchInfo(matchDAO: MatchDAO): Future[AllMatchInfo] = {
    val p1F = tables.getPlayer(matchDAO.player1Id)
    val p2F = tables.getPlayer(matchDAO.player2Id)
    val tF = tables.getTTTable(matchDAO.ttTableId)
    val mtF = tables.getMatchType(matchDAO.matchTypeId)
    val tyF = tables.getType(matchDAO.typeId)
    val gF = tables.getGroup(matchDAO.groupId)
    val pF = for {
      p1 <- p1F
      p2 <- p2F
      t <- tF
      mt <- mtF
      ty <- tyF
      g <- gF
    } yield(p1.get, p2.get, t, mt.get, ty.get, g)
    pF map {p =>
      AllMatchInfo(
        matchDAO,
        p._1,
        p._2,
        p._3,
        p._4,
        p._5,
        p._6
      )
    }
  }

  def getAllMatches = Action.async {
    val matchesF = tables.allMatches()
    val x = matchesF map {matches =>
      matches map(ttMatch => getAllMatchInfo(ttMatch))
    }
    val z = x map {y => Future.sequence(y)}
    val z2 = z.flatMap(z => z)
    z2 map {z =>
      Ok(Json.toJson(z))
    }
  }

  def getMatch(id: Long) = Action.async {
    val matchF = tables.getMatch(id)
    matchF flatMap { ttMatch =>
      val amiF = getAllMatchInfo(ttMatch.get)
      amiF map { ami =>
        Ok(Json.toJson(ami))
      }
    }
  }

  def setResult(id: Long, result: Seq[Int]) = Action{Ok("not implemented")}
}