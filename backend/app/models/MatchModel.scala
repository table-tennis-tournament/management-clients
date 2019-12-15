package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.functional.syntax._
import play.api.libs.json._
import play.api.libs.json.Json._

/**
  * Created by jonas on 29.12.16.
  */
object MatchModel {
  import models.PlayerModel._
  import play.api.libs.json.JodaWrites

  implicit val dateTimeWriter: Writes[DateTime] = JodaWrites.jodaDateWrites("dd/MM/yyyy HH:mm:ss")

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

  implicit val typeWrites = new Writes[Type] {
    def writes(ttType: Type) = Json.obj(
      "id" -> ttType.id,
      "name" -> ttType.name,
      "kind" -> ttType.kind,
      "active" -> ttType.active
    )
  }

  implicit val groupWrites: Writes[Group] = (group: Group) => Json.obj(
    "id" -> group.id,
    "name" -> group.name
  )

  implicit val ttMatchWrites: Writes[TTMatch] = (ttMatch: TTMatch) => Json.obj(
    "id" -> ttMatch.id,
    "startTime" -> ttMatch.startTime,
    //"isPlayed" -> ttMatch.isPlayed,
    //"allowedTableGroups" -> ttMatch.allowedTableGroups,
    "result" -> ttMatch.getResult
    //"colorId" -> ttMatch.colorId
  )

  implicit val stateWrites: Writes[MatchState] = {
    case Open => Json.toJson("Open")
    case InWaitingList => Json.toJson("InWaitingList")
    case Callable => Json.toJson("Callable")
    case OnTable => Json.toJson("OnTable")
    case Finished => Json.toJson("Finished")
    case Completed => Json.toJson("Completed")
    case Started => Json.toJson("Started")
  }

  implicit val allMatchInfoWrites = new Writes[AllMatchInfo] {
    def writes(allMatchInfo: AllMatchInfo) = Json.obj(
      "id" -> allMatchInfo.ttMatch.id,
      "startTime" -> allMatchInfo.ttMatch.startTime,
      //"isPlayed" -> allMatchInfo.ttMatch.isPlayed,
      "result" -> allMatchInfo.ttMatch.getResult,
      "team1" -> allMatchInfo.player1,
      "team2" -> allMatchInfo.player2,
      "matchType" -> allMatchInfo.matchType,
      "type" -> allMatchInfo.ttType,
      "group" -> allMatchInfo.group,
      "isPlayable" -> allMatchInfo.isPlayable,
      "state" -> allMatchInfo.state,
      "table" -> allMatchInfo.table
    )
  }

  implicit val tableManagerMatchWrites = new Writes[TableManagerMatch] {
    def writes(tableManagerMatch: TableManagerMatch) = Json.obj(
      "match_id" -> tableManagerMatch.id,
      "result" -> tableManagerMatch.result,
      "players_a" -> tableManagerMatch.player1,
      "players_b" -> tableManagerMatch.player2,
      "stage" -> tableManagerMatch.stage,
      "classification" -> tableManagerMatch.classification,
      "state" -> tableManagerMatch.state
    )
  }

  implicit val matchListWrites: Writes[MatchList] = (matchList: MatchList) => Json.obj(
    "id" -> matchList.uuid,
    "matchIds" -> matchList.matchId,
    "position" -> matchList.position,
    "group" -> matchList.asGroup
  )

  implicit val matchListReads: Reads[MatchList] = (
    (JsPath \ "uuid").readNullable[UUID] and
    (JsPath \ "matchIds").read[Seq[Long]] and
    (JsPath \ "group").readNullable[Long] and
    (JsPath \ "position").read[Int]
    )(MatchList.apply _)

  implicit val matchListInfoWrites: Writes[MatchListInfo] = (matchListInfo: MatchListInfo) => Json.obj(
    "matchListItem" -> matchListInfo.matchList,
    "matchinfo" -> matchListInfo.ttMatch
  )

  implicit val matchAggregateWrites = new Writes[MatchAggregate] {
    def writes(matchAggregate: MatchAggregate) = Json.obj(
      "name" -> matchAggregate.name,
      "startTime" -> matchAggregate.startTime,
      "tableNumbers" -> matchAggregate.tableNumbers,
      "discipline" -> matchAggregate.ttType,
      "players" -> matchAggregate.players,
      "matches" -> matchAggregate.matches
    )
  }

  implicit val tableManagerResult: Writes[TableManagerResult] = (result: TableManagerResult) => Json.obj(
    "games" -> result.games,
    "games_won_player_a" -> result.gamesWonPlayerA,
    "games_won_player_b" -> result.gamesWonPlayerB
  )

  implicit val tableManagerGame: Writes[TableManagerGame] = (game: TableManagerGame) => Json.obj(
    "score_player_a" -> game.scorePlayerA,
    "score_player_b" -> game.scorePlayerB
  )
}

case class AllMatchInfo(
    ttMatch: TTMatch,
    player1: Seq[Player],
    player2: Seq[Player],
    matchType: MatchType,
    ttType: Type,
    group: Option[Group],
    isPlayable: Boolean,
    state: MatchState,
    table: Seq[Int]
  )

case class TableManagerMatch(
    id: Long,
    result: TableManagerResult,
    player1: Seq[TableManagerPlayer],
    player2: Seq[TableManagerPlayer],
    stage: String,
    classification: String,
    state: MatchState
  )

case class TableManagerResult(
   games: Seq[TableManagerGame],
   gamesWonPlayerA: Int,
   gamesWonPlayerB: Int
 )

case class TableManagerGame(
   scorePlayerA: Int,
   scorePlayerB: Int
 )

case class MatchAggregate(
   name: String,
   startTime: DateTime,
   tableNumbers: Seq[Int],
   ttType: Type,
   players: Seq[Player],
   matches: Seq[AllMatchInfo]
 )

case class TTMatch(
    id: Long,
    //isPlaying: Boolean,
    team1Id: Long,
    team2Id: Long,
    player1Ids: Seq[Long],
    player2Ids: Seq[Long],
    //ttTableId: Option[Long],
    //isPlayed: Boolean,
    matchTypeId: Long,
    typeId: Long,
    groupId: Option[Long],
    startTime: DateTime,
    resultRaw: String,
    result: String,
    balls1: Int,
    balls2: Int,
    sets1: Int,
    sets2: Int,
    nr: Int,
    plannedTableId: Option[Long],
    kindId: Int,
    roundNumber: Option[Int],
    state: MatchState
  ) {
  def getResult: Option[Seq[Seq[Int]]] = {
    if(resultRaw != "") {
      val setsRaw = resultRaw.split(",")
      val sets = setsRaw.toSeq.map(set => set.split("=").toSeq.map(i => i.toInt))
      Some(sets)
    } else {
      None
    }
  }
  def getWinnerIds: Seq[Long] = {
    if(sets1 > sets2) {
      player1Ids
    } else {
      player2Ids
    }
  }
}

case class MatchDAO(
    id: Long,
    isPlaying: Boolean,
    team1Id: Long,
    team2Id: Long,
    ttTableId: Option[Long],
    isPlayed: Boolean,
    matchTypeId: Long,
    typeId: Long,
    groupId: Option[Long],
    startTime: DateTime,
    resultRaw: String,
    result: String,
    balls1: Int,
    balls2: Int,
    sets1: Int,
    sets2: Int,
    nr: Int,
    plannedTableId: Option[Long],
    roundNumber: Int,
    winnerId: Option[Long]
  ) {
  lazy val getResult: Option[Seq[Seq[Int]]] = {
    if(resultRaw != "") {
      val setsRaw = resultRaw.split(",")
      val sets = setsRaw.toSeq.map(set => set.split("=").toSeq.map(i => i.toInt))
      Some(sets)
    } else {
      None
    }
  }
}

case class MatchType(
    id: Long,
    name: String
  )

case class Type(
    id: Long,
    name: String,
    kind: Int,
    active: Boolean
  )

case class Group(
    id: Long,
    name: String
  )

case class Double(
    id: Long,
    player1Id: Long,
    player2Id: Long,
    kindId: Int
  )

case class MatchList(
    uuid: Option[UUID],
    matchId: Seq[Long],
    asGroup: Option[Long],
    position: Int
  )


case class MatchListInfo(
    matchList: MatchList,
    ttMatch: Seq[AllMatchInfo]
  )

case class DisciplinMatches(
    name: String,
    players: Seq[Player],
    matches: Seq[AllMatchInfo],
    tableNumbers: Seq[Int],
    isPlayerActive: Boolean = true,
    isMatchActive: Boolean = true,
    isComplete: Boolean = false
)

sealed trait MatchState
case object Open extends MatchState
case object InWaitingList extends MatchState
case object Callable extends MatchState
case object OnTable extends MatchState
case object Finished extends MatchState
case object Completed extends MatchState
case object Started extends MatchState

case class MatchTable (
  uuid: UUID,
  matchId: Long,
  tableId: Long,
  state: Int,
  timestamp: DateTime
)