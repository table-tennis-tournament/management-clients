package controllers

import com.google.inject.Inject
import dao.Tables
import models.PlayerDAO
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import play.api.libs.json.{Json, Writes}
import play.api.mvc.{Action, Controller}

/**
  * Created by jonas on 09.10.16.
  */
class PlayerController @Inject() (tables: Tables) extends Controller{
  implicit val playerWrites = new Writes[PlayerDAO] {
    def writes(player: PlayerDAO) = Json.obj(
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

  def getAllPlayer = Action.async {
    val playerF = tables.allPlayer
    playerF.map {
      player: Seq[PlayerDAO] => Ok(Json.toJson(player))
    }
  }

  def getPaidPlayer = Action.async {
    val playerF = tables.paidPlayer
    playerF.map {
      player: Seq[PlayerDAO] => Ok(Json.toJson(player))
    }
  }
}
