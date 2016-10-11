package controllers

import com.google.inject.Inject
import dao.Tables
import models.{Match, MatchInfo, Player, TTTable}
import play.api.libs.json._
import play.api.mvc._
import play.api.libs.concurrent.Execution.Implicits.defaultContext
/**
  * Created by jonas on 10.10.16.
  */
class MatchController @Inject() (tables: Tables) extends Controller{

  implicit val ttMatchWrites = new Writes[Match] {
    def writes(ttMatch: Match) = Json.obj(
      "id" -> ttMatch.id,
      "isPlaying" -> ttMatch.isPlaying,
      "player1Id" -> ttMatch.player1Id,
      "player2Id" -> ttMatch.player2Id,
      "ttTableId" -> ttMatch.ttTableId
    )
  }

  implicit val playerWrites = new Writes[Player] {
    def writes(player: Player) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "paid" -> player.paid,
      "ttr" -> player.ttr,
      "sex" -> player.sex,
      "email" -> player.email,
      "zipCode" -> player.zipCode,
      "location" -> player.location,
      "street" -> player.street,
      "phone" -> player.phone
    )
  }

  implicit val ttTableWrites = new Writes[TTTable] {
    def writes(ttTable: TTTable) = Json.obj(
      "id" -> ttTable.id,
      "name" -> ttTable.name,
      "left" -> ttTable.left,
      "top" -> ttTable.top,
      "matchId" -> ttTable.matchId,
      "tourId" -> ttTable.tourId,
      "groupId" -> ttTable.groupId
    )
  }

  implicit val matchInfo= new Writes[MatchInfo] {
    def writes(matchInfo: MatchInfo) = Json.obj(
      "match" -> matchInfo.ttMatch,
      "table" -> matchInfo.ttTable,
      "player1" -> matchInfo.player1,
      "player2" -> matchInfo.player2
    )
  }


  def getAllMatches = Action.async {
    val matchesF = tables.allMatchesWithPlayerAndTable()
    matchesF map {
      matches: Seq[(Match, Option[TTTable], Option[Player], Option[Player])] =>
        var mi = Seq.empty[MatchInfo]
        for (m <- matches) {
          mi :+= new MatchInfo(m._1, m._2, m._3, m._4)
        }
        Ok(Json.toJson(mi))
    }
  }

  def setWaitingPos(id: Long, pos: Int) = Action.async {
    val a = tables.setWaitingPostiton(id, pos)
    a.flatMap {a => a map { a: Int =>
      if (a==1) Ok(a.toString)
      else NotFound(pos.toString)
    }}
  }
}