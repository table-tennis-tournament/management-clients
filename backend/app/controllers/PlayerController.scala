package controllers

import com.google.inject.Inject
import dao.Tables
import models.Player
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}

/**
  * Created by jonas on 09.10.16.
  */
class PlayerController @Inject() (tables: Tables) extends Controller{
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

  def getAllPlayer = Action.async {
    val playerF = tables.allPlayer
    playerF.map {
      player: Seq[Player] => Ok(Json.toJson(player))
    }
  }

  def getPlayer(id: Long) = Action.async {
    val playerF = tables.getPlayer(id)
    playerF map { player =>
      Ok(Json.toJson(player))
    }
  }
}
