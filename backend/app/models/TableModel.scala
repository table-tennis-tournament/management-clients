package models

import org.joda.time.DateTime
import play.api.libs.json.{Json, Writes}

/**
  * Created by jonas on 29.12.16.
  */

object TableModel {
  import models.MatchModel.allMatchInfoWrites
  import models.MatchModel.tableManagerMatchWrites
  import models.PlayerModel._
  import play.api.libs.json.JodaWrites

  implicit val dateTimeWriter: Writes[DateTime] = JodaWrites.jodaDateWrites("dd/MM/yyyy HH:mm:ss")

  implicit val playerWrites: Writes[Player] = (player: Player) => Json.obj(
    "id" -> player.id,
    "firstName" -> player.firstName,
    "lastName" -> player.lastName,
    "ttr" -> player.ttr,
    "sex" -> player.sex,
    "club" -> player.club
  )

  implicit val playerDAOWrites: Writes[PlayerDAO] = (player: PlayerDAO) => Json.obj(
    "id" -> player.id,
    "firstName" -> player.firstName,
    "lastName" -> player.lastName,
    "ttr" -> player.ttr,
    "sex" -> player.sex
    //"club" -> player.club
  )

  implicit val ttTableWrites: Writes[TTTable] = (ttTable: TTTable) => Json.obj(
    "id" -> ttTable.id,
    "number" -> ttTable.tableNumber,
    "isLocked" -> ttTable.isLocked
  )

  implicit val resultWrites: Writes[(Int, Int)] = (result: (Int, Int)) => Json.obj(
    "player1" -> result._1,
    "player2" -> result._2
  )

  implicit val matchTypeWrites: Writes[MatchType] = (matchType: MatchType) => Json.obj(
    "id" -> matchType.id,
    "name" -> matchType.name
  )

  implicit val typeWrites: Writes[Type] = (ttType: Type) => Json.obj(
    "id" -> ttType.id,
    "name" -> ttType.name,
    "kind" -> ttType.kind
  )

  implicit val groupWrites: Writes[Group] = (group: Group) => Json.obj(
    "id" -> group.id,
    "name" -> group.name
  )

  implicit val ttMatchWrites: Writes[TTMatch] = (ttMatch: TTMatch) => Json.obj(
    "id" -> ttMatch.id,
    "startTime" -> ttMatch.startTime,
    //"isPlayed" -> ttMatch.isPlayed
    // "allowedTableGroups" -> ttMatch.allowedTableGroups,
    // "result" -> ttMatch.getResult
    // "colorId" -> ttMatch.colorId
  )

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

  implicit val tableInfoWrites: Writes[TableInfo] = (tableInfo: TableInfo) => Json.obj(
    "id" -> tableInfo.id,
    "number" -> tableInfo.tableNumber,
    "isLocked" -> tableInfo.isLocked,
    "matches" -> tableInfo.ttMatch
  )

  implicit val tableManagerTableWrites: Writes[TableManagerTableInfo] = (tableInfo: TableManagerTableInfo) => Json.obj(
    "table_id" -> tableInfo.tableId,
    "table_number" -> tableInfo.tableNumber,
    "table_manager_id" -> tableInfo.managerId,
    "matches" -> tableInfo.matches
  )
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
    id: Long,
    tableNumber: Int,
    isLocked: Option[Boolean],
    ttMatch: Seq[AllMatchInfo]
  )

case class TableManagerTableInfo(
    tableId: Long,
    tableNumber: Long,
    managerId: Long,
    matches: Seq[TableManagerMatch]
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
