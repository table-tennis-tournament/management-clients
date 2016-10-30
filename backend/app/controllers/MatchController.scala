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

  implicit val ttMatchWrites = new Writes[Match] {
    def writes(ttMatch: Match) = Json.obj(
      "id" -> ttMatch.id,
      "isPlaying" -> ttMatch.isPlaying
    )
  }

  implicit val clubWrites = new Writes[Club] {
    def writes(club: Club) = Json.obj(
      "id" -> club.id,
      "name" -> club.name
    )
  }

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

  implicit val ttTableWrites = new Writes[TTTable] {
    def writes(ttTable: TTTable) = Json.obj(
      "id" -> ttTable.id,
      "name" -> ttTable.name
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
}