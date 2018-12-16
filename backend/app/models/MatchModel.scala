package models

import java.util.UUID

import org.joda.time.DateTime
import play.api.libs.json._
import play.api.libs.functional.syntax._


/**
  * Created by jonas on 29.12.16.
  */
object MatchModel {
  import models.PlayerModel._
  import play.api.libs.json.JodaWrites

  implicit val dateTimeWriter: Writes[DateTime] = JodaWrites.jodaDateWrites("dd/MM/yyyy HH:mm:ss")

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
      "kind" -> ttType.kind,
      "active" -> ttType.active
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
      //"isPlayed" -> ttMatch.isPlayed,
      //"allowedTableGroups" -> ttMatch.allowedTableGroups,
      "result" -> ttMatch.getResult
      //"colorId" -> ttMatch.colorId
    )
  }

  implicit val stateWrites = new Writes[MatchState] {
    def writes(matchState: MatchState) = matchState match {
      case Open => Json.toJson("Open")
      case InWaitingList => Json.toJson("InWaitingList")
      case Callable => Json.toJson("Callable")
      case OnTable => Json.toJson("OnTable")
      case Finished => Json.toJson("Finished")
      case Completed => Json.toJson("Completed")
    }
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

  implicit val matchListWrites = new Writes[MatchList] {
    def writes(matchList: MatchList) = Json.obj(
      "id" -> matchList.uuid,
      "matchIds" -> matchList.matchId,
      "position" -> matchList.position,
      "group" -> matchList.asGroup
    )
  }

  implicit val matchListReads: Reads[MatchList] = (
    (JsPath \ "uuid").readNullable[UUID] and
    (JsPath \ "matchIds").read[Seq[Long]] and
    (JsPath \ "group").readNullable[Long] and
    (JsPath \ "position").read[Int]
    )(MatchList.apply _)

  implicit val matchListInfoWrites = new Writes[MatchListInfo] {
    def writes(matchListInfo: MatchListInfo) = Json.obj(
      "matchListItem" -> matchListInfo.matchList,
      "matchinfo" -> matchListInfo.ttMatch
    )
  }
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
  def getResult = {
    if(resultRaw != "") {
      val setsRaw = resultRaw.split(",")
      val sets = setsRaw.toSeq.map(set => set.split("=").toSeq.map(i => i.toInt))
      Some(sets)
    } else {
      None
    }
  }
  def getWinnerIds = {
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
  lazy val getResult = {
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