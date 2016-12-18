package models

import com.google.inject.Inject
import dao.Tables
import org.joda.time.DateTime
import play.api.Logger

case class TTTable(
  id: Long,
  tableNumber: Int,
  isLocked: Boolean,
  matchId: Option[Long]
)

case class TTTableGroup(
  id: Long,
  tables: Seq[TTTable],
  name: String
)

case class MatchDAO(
  id: Long,
  isPlaying: Boolean,
  player1Id: Long,
  player2Id: Long,
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
  playedTableId: Option[Long]
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

case class MatchType(
  id: Long,
  name: String
)

case class Type(
  id: Long,
  name: String,
  kind: Int
)

case class Group(
  id: Long,
  name: String
)