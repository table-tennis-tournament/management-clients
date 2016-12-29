package models

import play.api.libs.json.{Json, Writes}

/**
  * Created by jonas on 29.12.16.
  */

object PlayerModel {
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
}

case class Player(
    id: Long,
    firstName: String,
    lastName: String,
    ttr: Option[Int],
    sex: String,
    club: String
  )

case class PlayerDAO(
    id: Long,
    firstName: String,
    lastName: String,
    ttr: Option[Int],
    sex: String,
    clubId: Option[Long]
  )

case class Club(
    id: Long,
    clubName: String
  )
