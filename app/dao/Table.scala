package dao

import javax.inject.Inject

import models.{Match, TTTable}
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

    def * = (id, isPlaying) <> (Match.tupled, Match.unapply _)
  }
}
