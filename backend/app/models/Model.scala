package models

import java.sql.{Date, Timestamp}

import com.google.inject.Inject
import dao.Tables
import org.joda.time.DateTime
import scala.concurrent.ExecutionContext.Implicits.global

import scala.concurrent.Future

case class TTTableDAO(
                    id: Long,
                    name: String,
                    left: Long,
                    top: Long,
                    matchId: Option[Long],
                    tourId: Long,
                    groupId: Option[Long]
                  )

class TTTable (id: Long, name: String, left: Long, top: Long,
                                         matchId: Option[Long], tourId: Long, groupId: Option[Long]) {

}

case class MatchDAO(
                 id: Long,
                 isPlaying: Boolean,
                 player1Id: Long,
                 player2Id: Long,
                 ttTableId: Option[Long],
                 isPlayed: Boolean,
                 waitingList: Int
                 )

class Match @Inject() (tables: Tables)(id: Long, isPlaying: Boolean, player1Id: Long, player2Id: Long,
                                       ttTableId: Option[Long], isPlayed: Boolean, waitingList: Int) {
  def player1: Future[Player] = tables.getPlayer(player1Id) map {p => p.get}
  def player2: Future[Player] = tables.getPlayer(player2Id) map {p => p.get}
  def ttTable: Future[Option[TTTable]] = if(ttTableId.isDefined) {
    tables.getTTTable(ttTableId.get)
  } else {
    Future(None)
  }
}

case class PlayerDAO(
                  id: Long,
                  firstName: String,
                  lastName: String,
                  ttr: Option[Int],
                  paid: Boolean,
                  sex: String,
                  email: Option[String],
                  zipCode: Option[String],
                  location: Option[String],
                  street: Option[String],
                  phone: Option[String]
                  )

class Player(id: Long, firstName: String, lastName: String, ttr: Option[Int], paid: Boolean,
             sex: String, email: Option[String], zipCode: Option[String], location: Option[String],
             street: Option[String], phone: Option[String]){

}

case class MatchInfo (
                       ttMatch: MatchDAO,
                       ttTable: Option[TTTableDAO],
                       player1: Option[PlayerDAO],
                       player2: Option[PlayerDAO]
                     )