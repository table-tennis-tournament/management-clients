package models

import play.api.libs.json.{Json, Writes}

/**
  * Created by jonas on 29.12.16.
  */

object TableModel {
  import models.PlayerModel._

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

  implicit val allMatchInfoTableWrites = new Writes[AllMatchInfoTable] {
    def writes(allMatchInfo: AllMatchInfoTable) = Json.obj(
      "match" -> allMatchInfo.ttMatch,
      "team1" -> allMatchInfo.player1,
      "team2" -> allMatchInfo.player2,
      "matchType" -> allMatchInfo.matchType,
      "type" -> allMatchInfo.ttType,
      "group" -> allMatchInfo.group
    )
  }

  implicit val tableInfoWrites = new Writes[TableInfo] {
    def writes(tableInfo: TableInfo) = Json.obj(
      "table" -> tableInfo.ttTable,
      "matchinfo" -> tableInfo.ttMatch
    )
  }
}

case class AllMatchInfoTable(
    ttMatch: TTMatch,
    player1: Seq[Player],
    player2: Seq[Player],
    matchType: MatchType,
    ttType: Type,
    group: Option[Group]
  )

case class TableInfo(
    ttTable: TTTable,
    ttMatch: Seq[AllMatchInfoTable]
  )

case class TTTable(
    id: Long,
    tableNumber: Int,
    isLocked: Option[Boolean],
    matchId: Seq[Long] = Seq.empty[Long]
  )

case class TTTableDAO(
    id: Long,
    tableNumber: Int,
    isLocked: Option[Boolean]
  )

case class TTTableGroup(
    id: Long,
    tables: Seq[TTTable],
    name: String
  )
