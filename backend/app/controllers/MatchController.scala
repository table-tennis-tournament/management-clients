package controllers

import com.google.inject.Inject
import dao.Tables
import models._
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
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

  implicit val ttMatchWrites = new Writes[Match] {
    def writes(ttMatch: Match) = Json.obj(
      "id" -> ttMatch.id,
      "player1" -> ttMatch.player1,
      "player2" -> ttMatch.player2,
      "matchType" -> ttMatch.matchType,
      "tapeName" -> ttMatch.typeName,
      "groupName" -> ttMatch.groupName,
      "startTime" -> ttMatch.startTime,
      //"allowedTableGroups" -> ttMatch.allowedTableGroups,
      //"result" -> ttMatch.result,
      //"colorId" -> ttMatch.colorId,
      "table" -> ttMatch.ttTable
    )
  }

  def getAllMatches = Action.async {
    val matchesF = tables.allMatches()
    matchesF map { matches =>
      Ok(Json.toJson(matches))
    }
  }

  def getMatch(id: Long) = Action.async {
    val matchF = tables.getMatch(id)
    matchF map { ttMatch =>
      Ok(Json.toJson(ttMatch))
    }
  }

  def setResult(id: Long, result: Seq[Int]) = Action{Ok("not implemented")}
}