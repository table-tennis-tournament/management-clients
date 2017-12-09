package models

import play.api.libs.json.{Json, Writes}

/**
  * Created by jonas on 29.12.16.
  */

object PlayerModel {
  implicit val clubWrites = Json.writes[Club]
  implicit val clubReads = Json.reads[Club]
  implicit val typeWrites = Json.writes[Type]
  implicit val typeReads = Json.reads[Type]
  implicit val playerWrites = new Writes[Player] {
    def writes(player: Player) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "ttr" -> player.ttr,
      "sex" -> player.sex,
      "club" -> player.club,
      "hasMatches" -> player.hasMatches,
      "types" -> player.typeIds
    )
  }

  implicit val playerTypesWrites = new Writes[PlayerTypes] {
    def writes(playerT: PlayerTypes) = Json.obj(
      "id" -> playerT.player.id,
      "firstName" -> playerT.player.firstName,
      "lastName" -> playerT.player.lastName,
      "ttr" -> playerT.player.ttr,
      "sex" -> playerT.player.sex,
      "club" -> playerT.player.club,
      "hasMatches" -> playerT.player.hasMatches,
      "types" -> playerT.typeIds
    )
  }

  implicit val playerDAOWrites = new Writes[PlayerDAO] {
    def writes(player: PlayerDAO) = Json.obj(
      "id" -> player.id,
      "firstName" -> player.firstName,
      "lastName" -> player.lastName,
      "ttr" -> player.ttr,
      "sex" -> player.sex,
      "clubId" -> player.clubId
    )
  }
}

case class Player(
    id: Long,
    firstName: String,
    lastName: String,
    ttr: Option[Int],
    sex: String,
    club: Option[Club],
    hasMatches: Boolean,
    typeIds: Seq[Long]
  )

case class PlayerTypes(
    player: Player,
    typeIds: Seq[Long]
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
