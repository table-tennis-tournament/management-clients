package dao

import javax.inject.Inject

import models._
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import slick.driver.JdbcProfile

import scala.concurrent.Future
import scala.concurrent.duration._

/**
  * Created by jonas on 29.09.16.
  */

class Tables @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {
  import driver.api._

  // on Server start
  Logger.info("config database")
  dbConfigProvider.get.db.run(sqlu"""CREATE TRIGGER tables_trigger BEFORE UPDATE ON matches BEGIN @tables_updated = 1;""") map {
    result => Logger.info("result: " + result.toString)
  }


  // Tables
  private val ttTables = TableQuery[TTTablesTable]
  private val matches = TableQuery[MatchesTable]
  private val player = TableQuery[PlayerTable]


  def allTTTables(): Future[Seq[TTTable]] = {
    Logger.info("all()")
    dbConfigProvider.get.db.run(ttTables.filter(_.name =!= "0").result)
  }

  class TTTablesTable(tag: Tag) extends Table[TTTable](tag, "tables") {

    def id = column[Long]("Tabl_ID", O.PrimaryKey, O.AutoInc)
    def name = column[String]("Tabl_Name")
    def left = column[Long]("Tabl_Left")
    def top = column[Long]("Tabl_Top")
    def matchId = column[Option[Long]]("Tabl_Matc_ID")
    def tourId = column[Long]("Tabl_Tour_ID")
    def groupId = column[Option[Long]]("Tabl_Group")

    def ttMatch = foreignKey("Matc_FK", matchId, matches)(_.id.?)

    def * = (id, name, left, top, matchId, tourId, groupId) <> (TTTable.tupled, TTTable.unapply _)
  }

  // Matches
  def allMatches(): Future[Seq[Match]] = {
    dbConfigProvider.get.db.run(matches.result)
  }

  // Update the position in the waiting list. Plain SQL because Slick 3 does not support such querries
  def setWaitingPostiton(id: Long, pos: Int) = {
    dbConfigProvider.get.db.run(matches.filter(_.id === id).result) map { result =>
      val oldPos = result.head.waitingList
      val sqlQ1 = if(oldPos == 0) sqlu"""""" else
        sqlu"""update matches set Matc_Waitinglist = Matc_Waitinglist - 1 where Matc_Waitinglist >= ${oldPos} AND Matc_Waitinglist != 0"""

      val f1 = dbConfigProvider.get.db.run(sqlQ1)
      f1 flatMap { r =>
        val sqlQ2 = sqlu"""update matches set Matc_Waitinglist = Matc_Waitinglist + 1 where Matc_Waitinglist >= ${pos} AND Matc_Waitinglist != 0"""
        val f2 = dbConfigProvider.get.db.run(sqlQ2)
        f2 flatMap { k =>
          val add = for {m <- matches if m.id === id} yield m.waitingList
          dbConfigProvider.get.db.run(add.update(pos))
        }
      }
    }
  }

  val matchPlayerTable = for {
    (((m,t),p1),p2) <- matches.filterNot(_.isPlaying).filterNot(_.isPlayed).filter(_.waitingList === 0) joinLeft ttTables on (_.ttTableId === _.id) joinLeft player on (_._1.player1Id === _.id) joinLeft player on (_._1._1.player2Id === _.id)
  } yield (m, t, p1, p2)

  def allMatchesWithPlayerAndTable()= {
    dbConfigProvider.get.db.run(matchPlayerTable.result)
  }

  class MatchesTable(tag: Tag) extends Table[Match](tag, "matches") {

    def id = column[Long]("Matc_ID", O.PrimaryKey, O.AutoInc)
    def isPlaying = column[Boolean]("Matc_IsPlaying")
    def player1Id = column[Long]("Matc_Play1_ID")
    def player2Id = column[Long]("Matc_Play2_ID")
    def ttTableId = column[Option[Long]]("Matc_Tabl_ID")
    def isPlayed = column[Boolean]("Matc_Played")
    def waitingList = column[Int]("Matc_Waitinglist")

    def * = (id, isPlaying, player1Id, player2Id, ttTableId, isPlayed, waitingList) <> (Match.tupled, Match.unapply _)

    def player1 = foreignKey("Play1_FK", player1Id, player)(_.id)
    def player2 = foreignKey("Play2_FK", player2Id, player)(_.id)
    def ttTable = foreignKey("Table_FK", ttTableId, ttTables)(_.id.?)
  }

  // Players


  def allPlayer: Future[Seq[Player]] = {
    dbConfigProvider.get.db.run(player.result)
  }

  def paidPlayer: Future[Seq[Player]] = {
    dbConfigProvider.get.db.run(player.filter(_.paid === true).result)
  }

  class PlayerTable(tag: Tag) extends Table[Player](tag, "player") {
    def id = column[Long]("Play_ID", O.PrimaryKey, O.AutoInc)
    def firstName = column[String]("Play_FirstName")
    def lastName = column[String]("Play_LastName")
    def ttr = column[Option[Int]]("Play_TTR")
    def paid = column[Boolean]("Play_Paid")
    def sex = column[String]("Play_Sex")
    def email = column[Option[String]]("Play_Email")
    def zipCode = column[Option[String]]("Play_PLZ")
    def location = column[Option[String]]("Play_Location")
    def street = column[Option[String]]("Play_Street")
    def phone = column[Option[String]]("Play_TelNr")

    def * = (id, firstName, lastName, ttr, paid, sex, email, zipCode, location, street, phone) <> (Player.tupled, Player.unapply)
  }
}
