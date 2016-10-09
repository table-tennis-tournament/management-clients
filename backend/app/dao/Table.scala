package dao

import javax.inject.Inject

import models._
import play.api.Logger
import play.api.db.slick.{DatabaseConfigProvider, HasDatabaseConfigProvider}
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import slick.driver.JdbcProfile

import scala.concurrent.Future

/**
  * Created by jonas on 29.09.16.
  */

class Tables @Inject()(protected val dbConfigProvider: DatabaseConfigProvider) extends HasDatabaseConfigProvider[JdbcProfile] {
  import driver.api._

  //Tables
  private val ttTables = TableQuery[TTTablesTable]

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

  //Matches
  private val matches = TableQuery[MatchesTable]

  def allMatches(): Future[Seq[Match]] = {
    dbConfigProvider.get.db.run(matches.result)
  }

  class MatchesTable(tag: Tag) extends Table[Match](tag, "matches") {

    def id = column[Long]("Matc_ID", O.PrimaryKey, O.AutoInc)
    def isPlaying = column[Boolean]("Matc_IsPlaying")
    def player1Id = column[Option[Long]]("Matc_Play1_ID")
    def player2Id = column[Option[Long]]("Matc_Play2_ID")

    def * = (id, isPlaying) <> (Match.tupled, Match.unapply _)

    def player1 = foreignKey("Play1_FK", player1Id, player)(_.id.?)
    def player2 = foreignKey("Play2_FK", player2Id, player)(_.id.?)
  }

  //Players
  private val player = TableQuery[PlayerTable]

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
