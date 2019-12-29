package models

import java.sql.Timestamp

import play.api.libs.json._

/**
  * Created by jonas on 29.12.16.
  */

object PlayerModel {
  implicit val clubWrites: OWrites[Club] = Json.writes[Club]
  implicit val clubReads: Reads[Club] = Json.reads[Club]
  implicit val typeWrites: OWrites[Type] = Json.writes[Type]
  implicit val typeReads: Reads[Type] = Json.reads[Type]
  implicit val playerWrites: Writes[Player] = (player: Player) => Json.obj(
    "id" -> player.id,
    "firstName" -> player.firstName,
    "lastName" -> player.lastName,
    "ttr" -> player.ttr,
    "sex" -> player.sex,
    "club" -> player.club,
    "hasMatches" -> player.hasMatches,
    "types" -> player.typeIds
  )

  implicit val playerTypesWrites: Writes[PlayerTypes] = (playerT: PlayerTypes) => Json.obj(
    "id" -> playerT.player.id,
    "firstName" -> playerT.player.firstName,
    "lastName" -> playerT.player.lastName,
    "ttr" -> playerT.player.ttr,
    "sex" -> playerT.player.sex,
    "club" -> playerT.player.club,
    "hasMatches" -> playerT.player.hasMatches,
    "types" -> playerT.typeIds
  )

  implicit val playerDAOWrites: Writes[PlayerDAO] = (player: PlayerDAO) => Json.obj(
    "id" -> player.id,
    "firstName" -> player.firstName,
    "lastName" -> player.lastName,
    "ttr" -> player.ttr,
    "sex" -> player.sex,
    "clubId" -> player.clubId
  )

  implicit val tableManagerPlayerWrites: Writes[TableManagerPlayer] = (player: TableManagerPlayer) => Json.obj(
    "player_id" -> player.id,
    "first_name" -> player.firstName,
    "last_name" -> player.lastName,
    "club" -> player.club,
    "call_count" -> player.callCount
  )

  implicit val typePerPlayerOutWrites: Writes[TypePerPlayerOut] = (tpp: TypePerPlayerOut) => Json.obj(
    "id" -> tpp.id,
    "player" -> tpp.player,
    "type" -> tpp.ttType,
    "ttr" -> tpp.paid
  )
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

case class TableManagerPlayer(
   id: Long,
   firstName: String,
   lastName: String,
   club: String,
   callCount: Int,
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

case class PlayerPerGroup(
  id: Long,
  playerId: Long,
  groupId: Long,
  groupPos: Long,
  matchesWon: Long,
  matchesLost: Long,
  setsWon: Long,
  setsLost: Long,
  pointsWon: Long,
  pointsLost: Long,
  games: String,
  sets: String,
  points: String,
  checked: Boolean,   // all matches played
  setsDiff: Long
)

case class TypePerPlayer (
   id: Long,
   playerId: Long,
   typeId: Long,
   seed: Long,
   paid: Boolean,
   timestamp: String,
   cashId: Long,
   externalId: Option[String]
)

case class TypePerPlayerOut (
                              id: Long,
                              player: Option[Player],
                              ttType: Option[Type],
                              paid: Boolean
)